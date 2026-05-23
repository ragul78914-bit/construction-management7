import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db, storage } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';


// Generate initial admin fallback (Keep one admin to ensure login is possible)
const initialAdmin = {
  id: 'admin_1',
  role: 'Admin',
  name: 'Ragul',
  email: 'ragul78914@gmail.com',
  password: '12345678',
  phone: '0000000000'
};

const initialSupervisors = [];
const initialWorkers = [];
const initialSites = [];
const initialMaterials = [];
const initialSpendRecords = [];
const initialWageEntries = [];
const initialAttendanceEntries = [];
const initialProgressUpdates = [];
const initialMessages = [];

const useStore = create(
  persist(
    (set, get) => ({
  // Auth state
  currentUser: null,
  isAuthenticated: false,
  otpVerificationPending: false,
  pendingUserLogin: null, // Holds user info before OTP is verified

  // Domain data
  users: [initialAdmin, ...initialSupervisors, ...initialWorkers],
  sites: initialSites,
  materials: initialMaterials,
  spendRecords: [],
  wageEntries: [],
  attendanceEntries: [],
  progressUpdates: [],
  /*
   * messages schema:
   *   id, type ('direct'|'broadcast'),
   *   fromId, fromName, fromRole,
   *   -- direct fields --
   *   toId, toName, toRole,
   *   -- broadcast fields --
   *   audience ('all'|'Supervisor'|'Worker'),
   *   category ('Announcement'|'Report'|'Event'|'General'),
   *   -- common --
   *   subject, body,
   *   attachmentName?, attachmentData?,
   *   timestamp,
   *   readBy: [userId, ...],   // IDs of users who have read this
   *   replies: [{ id, fromId, fromRole, fromName, body, timestamp }]
   */
  messages: [],

  // --- Initialize Data from Firebase ---
  initializeData: () => {
    // Listen to Users
    onSnapshot(collection(db, "users"), (snapshot) => {
      const dbUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Always ensure initialAdmin exists — merge it if Firebase doesn't have an Admin
      const hasAdmin = dbUsers.some(u => u.role === 'Admin');
      const mergedUsers = dbUsers.length > 0
        ? (hasAdmin ? dbUsers : [initialAdmin, ...dbUsers])
        : [initialAdmin];
      set({ users: mergedUsers });
    });

    // Listen to Sites
    onSnapshot(collection(db, "sites"), (snapshot) => {
      const dbSites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ sites: dbSites });
    });

    // Listen to Materials
    onSnapshot(collection(db, "materials"), (snapshot) => {
      const dbMaterials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ materials: dbMaterials });
    });

    // Listen to Spends
    onSnapshot(collection(db, "spends"), (snapshot) => {
      const dbSpends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ spendRecords: dbSpends });
    });

    // Listen to Wages
    onSnapshot(collection(db, "wages"), (snapshot) => {
      const dbWages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ wageEntries: dbWages });
    });

    // Listen to Attendance
    onSnapshot(collection(db, "attendance"), (snapshot) => {
      const dbAttendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ attendanceEntries: dbAttendance });
    });

    // Listen to Progress
    onSnapshot(collection(db, "progress"), (snapshot) => {
      const dbProgress = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ progressUpdates: dbProgress });
    });

    // Listen to Messages
    onSnapshot(collection(db, "messages"), (snapshot) => {
      const dbMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ messages: dbMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) });
    });
  },

  // --- Auth Actions ---
  // Login by email/password ONLY — role is auto-detected from DB
  loginWithCredentials: (identifier, password) => {
    const { users } = get();

    // Debug: log what users are currently in the store
    console.log('[Login] Attempting login for:', identifier);
    console.log('[Login] Total users in store:', users.length);
    console.log('[Login] Users:', users.map(u => ({ email: u.email, phone: u.phone, role: u.role, hasPassword: !!u.password })));

    // Always check initialAdmin as a hard fallback (in case Firebase wiped it)
    const allUsers = users.some(u => u.role === 'Admin')
      ? users
      : [initialAdmin, ...users];

    // Find user by email or phone + password only
    const matchedUser = allUsers.find(u =>
      (u.email === identifier || u.phone === identifier) &&
      u.password === password
    );

    if (!matchedUser) {
      console.log('[Login] No matching user found.');
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    console.log('[Login] Matched user:', matchedUser.email, '| Role:', matchedUser.role);

    // Check if the account is inactive
    if (matchedUser.status === 'Inactive') {
      return { success: false, error: 'Account is inactive. Please contact admin.' };
    }

    // Set currentUser with the real role from DB
    set({ 
      currentUser: matchedUser,
      isAuthenticated: true,
      otpVerificationPending: false,
      pendingUserLogin: null
    });
    return { success: true, role: matchedUser.role };
  },

  verifyOTP: (otp) => {
    const { pendingUserLogin } = get();
    if (otp === '123456' && pendingUserLogin) { // Mock OTP check
      set({ 
        currentUser: pendingUserLogin, 
        isAuthenticated: true, 
        otpVerificationPending: false,
        pendingUserLogin: null
      });
      return { success: true };
    }
    return { success: false, error: 'Invalid or expired verification code. Please try again.' };
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  signUp: (userData) => {
    const { users } = get();
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'This email is already registered' };
    }
    if (users.find(u => u.phone === userData.phone)) {
      return { success: false, error: 'This phone number is already registered' };
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      status: 'Active',
      documents: []
    };
    
    // Save to Firestore
    setDoc(doc(db, "users", newUser.id), newUser).catch(console.error);

    set({ 
      users: [...users, newUser],
      currentUser: newUser,
      isAuthenticated: true,
      otpVerificationPending: false,
      pendingUserLogin: null
    });
    return { success: true };
  },

  changePassword: (userId, currentP, newP) => {
    const { users } = get();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found' };
    
    if (users[idx].password !== currentP) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    const newUsers = [...users];
    newUsers[idx].password = newP;
    
    // Update currentUser if it matches
    const { currentUser } = get();
    let nextCurrentUser = currentUser;
    if (currentUser?.id === userId) {
      nextCurrentUser = { ...currentUser, password: newP };
    }

    set({ users: newUsers, currentUser: nextCurrentUser });
    return { success: true };
  },

  resetPassword: (email, newP) => {
    const { users } = get();
    const idx = users.findIndex(u => u.email === email);
    if (idx !== -1) {
      const newUsers = [...users];
      newUsers[idx].password = newP;
      set({ users: newUsers });
    }
  },

  checkEmailExists: (email) => {
    const { users } = get();
    return !!users.find(u => u.email === email);
  },

  // --- Site Actions ---
  addSite: (siteData) => {
    const newSite = { id: `site_${Date.now()}`, client: { documents: [] }, ...siteData };
    setDoc(doc(db, "sites", newSite.id), newSite).catch(console.error);
    set((state) => ({ sites: [...state.sites, newSite] }));
  },
  updateSite: (siteId, data) => {
    setDoc(doc(db, "sites", siteId), data, { merge: true }).catch(console.error);
    set((state) => ({
      sites: state.sites.map(s => s.id === siteId ? { ...s, ...data } : s)
    }));
  },
  deleteSite: (siteId, force = false) => {
    const { users } = get();
    const activeWorkers = users.filter(u => u.role === 'Worker' && u.assignedSite === siteId && u.status === 'Active');
    if (activeWorkers.length > 0 && !force) {
      return { success: false, error: 'This site has active workers. Confirm deletion?' }; // Frontend handles confirmation
    }
    deleteDoc(doc(db, "sites", siteId)).catch(console.error);
    set((state) => ({ sites: state.sites.filter(s => s.id !== siteId) }));
    return { success: true };
  },

  // --- Spend Actions ---
  addSpend: (spendData) => {
    const id = `sp_${Date.now()}`;
    const newSpend = { id, ...spendData };
    setDoc(doc(db, "spends", id), newSpend).catch(console.error);
  },
  deleteSpend: (spendId) => {
    deleteDoc(doc(db, "spends", spendId)).catch(console.error);
  },

  // --- Materials Actions ---
  addMaterial: (matData) => {
    const newMat = { id: `mat_${Date.now()}`, ...matData };
    setDoc(doc(db, "materials", newMat.id), newMat).catch(console.error);
    set((state) => ({ materials: [...state.materials, newMat] }));
  },
  updateMaterial: (matId, data) => {
    setDoc(doc(db, "materials", matId), data, { merge: true }).catch(console.error);
    set((state) => ({
      materials: state.materials.map(m => m.id === matId ? { ...m, ...data } : m)
    }));
  },
  deleteMaterial: (matId) => {
    deleteDoc(doc(db, "materials", matId)).catch(console.error);
    set((state) => ({ materials: state.materials.filter(m => m.id !== matId) }));
  },

  // --- User/Worker/Supervisor Management ---
  promoteToAdmin: (userId) => {
    set((state) => ({
      users: state.users.map(u => u.id === userId ? { ...u, role: 'Admin', assignedSites: undefined } : u)
    }));
  },
  addUser: (userData) => {
    const newUser = { id: `user_${Date.now()}`, ...userData, documents: userData.documents || [] };
    
    // Save to Firestore
    setDoc(doc(db, "users", newUser.id), newUser).catch(console.error);

    set((state) => ({ users: [...state.users, newUser] }));
    return { success: true };
  },
  updateUser: (userId, data) => {
    // Update Firestore
    setDoc(doc(db, "users", userId), data, { merge: true }).catch(console.error);
    
    set((state) => ({
      users: state.users.map(u => u.id === userId ? { ...u, ...data } : u)
    }));
  },
  deleteUser: (userId) => {
    deleteDoc(doc(db, "users", userId)).catch(console.error);
    set((state) => ({
      users: state.users.filter(u => u.id !== userId)
    }));
  },
  assignWorkerToSite: (workerId, siteId) => {
    set((state) => ({
      users: state.users.map(u => u.id === workerId ? { ...u, assignedSite: siteId } : u)
    }));
  },

  // --- Wages ---
  addWageEntry: (data) => {
    const id = `wage_${Date.now()}`;
    setDoc(doc(db, "wages", id), { id, ...data }).catch(console.error);
  },

  // --- Attendance ---
  addAttendance: (data) => {
    const id = `att_${Date.now()}`;
    setDoc(doc(db, "attendance", id), { id, ...data }).catch(console.error);
  },
  updateAttendance: (attId, data) => {
    setDoc(doc(db, "attendance", attId), data, { merge: true }).catch(console.error);
  },
  deleteAttendance: (attId) => {
    deleteDoc(doc(db, "attendance", attId)).catch(console.error);
  },
  // Upsert: if an entry exists for (workerId, date) update it, else add new
  upsertAttendance: (data) => {
    const { attendanceEntries } = get();
    const existing = attendanceEntries.find(a => a.workerId === data.workerId && a.date === data.date);
    if (existing) {
      setDoc(doc(db, "attendance", existing.id), data, { merge: true }).catch(console.error);
    } else {
      const id = `att_${Date.now()}`;
      setDoc(doc(db, "attendance", id), { id, ...data }).catch(console.error);
    }
  },

  // --- Progress ---
  addProgress: (data) => {
    const id = `prog_${Date.now()}`;
    setDoc(doc(db, "progress", id), { id, ...data }).catch(console.error);
  },
  
  // --- Messaging ---

  // Send a DIRECT message (admin→user or user→admin)
  sendDirectMessage: (msgData) => {
    const id = `msg_${Date.now()}`;
    const newMsg = {
      id,
      type: 'direct',
      ...msgData,
      timestamp: new Date().toISOString(),
      readBy: [msgData.fromId], // sender has already "read" it
      replies: [],
    };
    setDoc(doc(db, "messages", id), newMsg).catch(console.error);
  },

  // Send a BROADCAST message (admin only)
  sendBroadcast: (msgData) => {
    const id = `msg_${Date.now()}`;
    const newMsg = {
      id,
      type: 'broadcast',
      ...msgData,
      timestamp: new Date().toISOString(),
      readBy: [msgData.fromId],
      replies: [],
    };
    setDoc(doc(db, "messages", id), newMsg).catch(console.error);
  },

  // Reply to any message
  replyMessage: (msgId, replyData) => {
    const { messages } = get();
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;

    const reply = { id: `rep_${Date.now()}`, ...replyData, timestamp: new Date().toISOString() };
    const updatedReplies = [...(msg.replies || []), reply];
    
    setDoc(doc(db, "messages", msgId), { replies: updatedReplies }, { merge: true }).catch(console.error);
  },

  // Mark specific messages as read for a user
  markMessageRead: (msgId, userId) => {
    const { messages } = get();
    const msg = messages.find(m => m.id === msgId);
    if (!msg || msg.readBy.includes(userId)) return;

    const updatedReadBy = [...msg.readBy, userId];
    setDoc(doc(db, "messages", msgId), { readBy: updatedReadBy }, { merge: true }).catch(console.error);
  },

  // Mark ALL visible messages as read for a user
  markAllRead: (userId) => {
    const { messages } = get();
    messages.forEach(m => {
      if (!m.readBy.includes(userId)) {
        const updatedReadBy = [...m.readBy, userId];
        setDoc(doc(db, "messages", m.id), { readBy: updatedReadBy }, { merge: true }).catch(console.error);
      }
    });
  },

  // Delete a message (admin only)
  deleteMessage: (msgId) => {
    deleteDoc(doc(db, "messages", msgId)).catch(console.error);
  },

  // --- Admin Documents ---


  addDocumentToUser: async (userId, document) => {
    const { users } = get();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // 1. Add immediately to local store with base64 so UI updates instantly
    const updatedDocuments = [...(user.documents || []), { ...document }];
    set((state) => ({
      users: state.users.map(u =>
        u.id === userId ? { ...u, documents: updatedDocuments } : u
      )
    }));

    // 2. Try Firebase Storage upload in background (non-blocking)
    try {
      let downloadURL = document.content;
      if (document.content && document.content.startsWith('data:')) {
        const storageRef = ref(storage, `users/${userId}/documents/${document.id}_${document.fileName}`);
        await uploadString(storageRef, document.content, 'data_url');
        downloadURL = await getDownloadURL(storageRef);
      }
      const finalDocument = { ...document, content: downloadURL };
      const cloudDocs = [...(user.documents || []), finalDocument];

      // Update Firestore with the real URL
      await setDoc(doc(db, 'users', userId), { documents: cloudDocs }, { merge: true });

      // Update local store again with the cloud URL (replace the base64 entry)
      set((state) => ({
        users: state.users.map(u => {
          if (u.id !== userId) return u;
          const docs = u.documents.map(d =>
            d.id === document.id ? finalDocument : d
          );
          return { ...u, documents: docs };
        })
      }));
    } catch (err) {
      // Cloud sync failed – document is still visible locally with base64
      console.warn('Cloud sync failed, document kept locally:', err.message);
    }
  },
  deleteDocumentFromUser: async (userId, docId) => {
    try {
      const { users } = get();
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const docToDelete = user.documents?.find(d => d.id === docId);
      if (docToDelete && docToDelete.content && docToDelete.content.includes('firebasestorage')) {
         // Attempt to delete from storage if it's a firebase URL
         // Note: Extracting ref from URL is complex, but we can recreate the ref path
         try {
           const storageRef = ref(storage, `users/${userId}/documents/${docToDelete.id}_${docToDelete.fileName}`);
           await deleteObject(storageRef);
         } catch (e) {
           console.log("Storage object might not exist or err: ", e);
         }
      }

      const updatedDocuments = user.documents.filter(d => d.id !== docId);

      // Update Firestore
      await setDoc(doc(db, "users", userId), { documents: updatedDocuments }, { merge: true });

      set((state) => ({
        users: state.users.map(u => {
          if (u.id === userId) {
            return { ...u, documents: updatedDocuments };
          }
          return u;
        })
      }));
      } catch (err) {
        console.error("Failed to delete document", err);
      }
    }
  }),
  {
    name: 'monex-storage',
    storage: createJSONStorage(() => typeof window !== 'undefined' ? window.localStorage : null),
    // Only persist these fields
    partialize: (state) => ({
      users: state.users,
      sites: state.sites,
      materials: state.materials,
      spendRecords: state.spendRecords,
      wageEntries: state.wageEntries,
      attendanceEntries: state.attendanceEntries,
      progressUpdates: state.progressUpdates,
      messages: state.messages,
      currentUser: state.currentUser,
      isAuthenticated: state.isAuthenticated
    }),
  })
);

export default useStore;
