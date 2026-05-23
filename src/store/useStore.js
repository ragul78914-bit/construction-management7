import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

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
      messages: [],

      // Polling interval reference
      _pollingInterval: null,

      // --- Initialize Data from MongoDB API ---
      initializeData: async () => {
        // Prevent double intervals
        const { stopPolling } = get();
        stopPolling();

        const fetchData = async () => {
          try {
            const [
              dbUsers,
              dbSites,
              dbMaterials,
              dbSpends,
              dbWages,
              dbAttendance,
              dbProgress,
              dbMessages
            ] = await Promise.all([
              apiGet('/api/users'),
              apiGet('/api/sites'),
              apiGet('/api/materials'),
              apiGet('/api/spends'),
              apiGet('/api/wages'),
              apiGet('/api/attendance'),
              apiGet('/api/progress'),
              apiGet('/api/messages')
            ]);

            set({
              users: dbUsers.length > 0 ? dbUsers : [initialAdmin],
              sites: dbSites,
              materials: dbMaterials,
              spendRecords: dbSpends,
              wageEntries: dbWages,
              attendanceEntries: dbAttendance,
              progressUpdates: dbProgress,
              messages: dbMessages
            });
          } catch (err) {
            console.error('Failed to poll data from MongoDB:', err);
          }
        };

        // Run immediately
        await fetchData();

        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        set({ _pollingInterval: interval });
      },

      stopPolling: () => {
        const { _pollingInterval } = get();
        if (_pollingInterval) {
          clearInterval(_pollingInterval);
          set({ _pollingInterval: null });
        }
      },

      // --- Auth Actions ---
      loginWithCredentials: (identifier, password, role) => {
        const { users } = get();
        let foundUser = null;
        
        foundUser = users.find(u => 
          (u.email === identifier || u.phone === identifier) && 
          u.password === password && 
          u.role === role
        );

        // If no exact match, check if this is an Admin trying to log into another panel
        if (!foundUser) {
          const adminUser = users.find(u => 
            (u.email === identifier || u.phone === identifier) && 
            u.password === password && 
            u.role === 'Admin'
          );
          if (adminUser) {
            // Let the Admin log in as the requested role (impersonation/testing)
            foundUser = { ...adminUser, role: role };
          }
        }

        if (foundUser) {
          if (foundUser.role !== 'Admin' && foundUser.status === 'Inactive') {
            return { success: false, error: 'Account is inactive.' };
          }
          set({ 
            currentUser: foundUser, 
            isAuthenticated: true,
            otpVerificationPending: false,
            pendingUserLogin: null
          });
          return { success: true };
        }
        return { success: false, error: 'Invalid email/phone number or password' };
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
        const { stopPolling } = get();
        stopPolling();
        set({ currentUser: null, isAuthenticated: false });
      },

      signUp: async (userData) => {
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
        
        try {
          await apiPost('/api/users', newUser);
          set({ 
            users: [...users, newUser],
            currentUser: newUser,
            isAuthenticated: true,
            otpVerificationPending: false,
            pendingUserLogin: null
          });
          return { success: true };
        } catch (err) {
          console.error('Sign up failed:', err);
          return { success: false, error: err.message };
        }
      },

      changePassword: async (userId, currentP, newP) => {
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

        try {
          await apiPut(`/api/users/${userId}`, { password: newP });
          set({ users: newUsers, currentUser: nextCurrentUser });
          return { success: true };
        } catch (err) {
          console.error('Password change failed:', err);
          return { success: false, error: err.message };
        }
      },

      resetPassword: async (email, newP) => {
        const { users } = get();
        const idx = users.findIndex(u => u.email === email);
        if (idx !== -1) {
          const newUsers = [...users];
          newUsers[idx].password = newP;
          try {
            await apiPut(`/api/users/${newUsers[idx].id}`, { password: newP });
            set({ users: newUsers });
          } catch (err) {
            console.error('Reset password failed:', err);
          }
        }
      },

      checkEmailExists: (email) => {
        const { users } = get();
        return !!users.find(u => u.email === email);
      },

      // --- Site Actions ---
      addSite: async (siteData) => {
        const newSite = { id: `site_${Date.now()}`, client: { documents: [] }, ...siteData };
        try {
          await apiPost('/api/sites', newSite);
          set((state) => ({ sites: [...state.sites, newSite] }));
        } catch (err) {
          console.error('Add site failed:', err);
        }
      },
      updateSite: async (siteId, data) => {
        try {
          await apiPut(`/api/sites/${siteId}`, data);
          set((state) => ({
            sites: state.sites.map(s => s.id === siteId ? { ...s, ...data } : s)
          }));
        } catch (err) {
          console.error('Update site failed:', err);
        }
      },
      deleteSite: async (siteId, force = false) => {
        const { users } = get();
        const activeWorkers = users.filter(u => u.role === 'Worker' && u.assignedSite === siteId && u.status === 'Active');
        if (activeWorkers.length > 0 && !force) {
          return { success: false, error: 'This site has active workers. Confirm deletion?' }; // Frontend handles confirmation
        }
        try {
          await apiDelete(`/api/sites/${siteId}`);
          set((state) => ({ sites: state.sites.filter(s => s.id !== siteId) }));
          return { success: true };
        } catch (err) {
          console.error('Delete site failed:', err);
          return { success: false, error: err.message };
        }
      },

      // --- Spend Actions ---
      addSpend: async (spendData) => {
        const id = `sp_${Date.now()}`;
        const newSpend = { id, ...spendData };
        try {
          await apiPost('/api/spends', newSpend);
          set((state) => ({ spendRecords: [...state.spendRecords, newSpend] }));
        } catch (err) {
          console.error('Add spend failed:', err);
        }
      },
      deleteSpend: async (spendId) => {
        try {
          await apiDelete(`/api/spends/${spendId}`);
          set((state) => ({ spendRecords: state.spendRecords.filter(s => s.id !== spendId) }));
        } catch (err) {
          console.error('Delete spend failed:', err);
        }
      },

      // --- Materials Actions ---
      addMaterial: async (matData) => {
        const newMat = { id: `mat_${Date.now()}`, ...matData };
        try {
          await apiPost('/api/materials', newMat);
          set((state) => ({ materials: [...state.materials, newMat] }));
        } catch (err) {
          console.error('Add material failed:', err);
        }
      },
      updateMaterial: async (matId, data) => {
        try {
          await apiPut(`/api/materials/${matId}`, data);
          set((state) => ({
            materials: state.materials.map(m => m.id === matId ? { ...m, ...data } : m)
          }));
        } catch (err) {
          console.error('Update material failed:', err);
        }
      },
      deleteMaterial: async (matId) => {
        try {
          await apiDelete(`/api/materials/${matId}`);
          set((state) => ({ materials: state.materials.filter(m => m.id !== matId) }));
        } catch (err) {
          console.error('Delete material failed:', err);
        }
      },

      // --- User/Worker/Supervisor Management ---
      promoteToAdmin: async (userId) => {
        try {
          await apiPut(`/api/users/${userId}`, { role: 'Admin', assignedSites: null });
          set((state) => ({
            users: state.users.map(u => u.id === userId ? { ...u, role: 'Admin', assignedSites: undefined } : u)
          }));
        } catch (err) {
          console.error('Promote to admin failed:', err);
        }
      },
      addUser: async (userData) => {
        const newUser = { id: `user_${Date.now()}`, ...userData, documents: userData.documents || [] };
        
        try {
          await apiPost('/api/users', newUser);
          set((state) => ({ users: [...state.users, newUser] }));
          return { success: true };
        } catch (err) {
          console.error('Add user failed:', err);
          return { success: false, error: err.message };
        }
      },
      updateUser: async (userId, data) => {
        try {
          await apiPut(`/api/users/${userId}`, data);
          set((state) => ({
            users: state.users.map(u => u.id === userId ? { ...u, ...data } : u)
          }));
        } catch (err) {
          console.error('Update user failed:', err);
        }
      },
      deleteUser: async (userId) => {
        try {
          await apiDelete(`/api/users/${userId}`);
          set((state) => ({
            users: state.users.filter(u => u.id !== userId)
          }));
        } catch (err) {
          console.error('Delete user failed:', err);
        }
      },
      assignWorkerToSite: async (workerId, siteId) => {
        try {
          await apiPut(`/api/users/${workerId}`, { assignedSite: siteId });
          set((state) => ({
            users: state.users.map(u => u.id === workerId ? { ...u, assignedSite: siteId } : u)
          }));
        } catch (err) {
          console.error('Assign worker to site failed:', err);
        }
      },

      // --- Wages ---
      addWageEntry: async (data) => {
        const id = `wage_${Date.now()}`;
        const newEntry = { id, ...data };
        try {
          await apiPost('/api/wages', newEntry);
          set((state) => ({ wageEntries: [...state.wageEntries, newEntry] }));
        } catch (err) {
          console.error('Add wage entry failed:', err);
        }
      },

      // --- Attendance ---
      addAttendance: async (data) => {
        const id = `att_${Date.now()}`;
        const newEntry = { id, ...data };
        try {
          await apiPost('/api/attendance', newEntry);
          set((state) => ({ attendanceEntries: [...state.attendanceEntries, newEntry] }));
        } catch (err) {
          console.error('Add attendance failed:', err);
        }
      },
      updateAttendance: async (attId, data) => {
        try {
          await apiPut(`/api/attendance/${attId}`, data);
          set((state) => ({
            attendanceEntries: state.attendanceEntries.map(a => a.id === attId ? { ...a, ...data } : a)
          }));
        } catch (err) {
          console.error('Update attendance failed:', err);
        }
      },
      deleteAttendance: async (attId) => {
        try {
          await apiDelete(`/api/attendance/${attId}`);
          set((state) => ({ attendanceEntries: state.attendanceEntries.filter(a => a.id !== attId) }));
        } catch (err) {
          console.error('Delete attendance failed:', err);
        }
      },
      upsertAttendance: async (data) => {
        try {
          const result = await apiPost('/api/attendance', data);
          set((state) => {
            const existingIdx = state.attendanceEntries.findIndex(a => a.workerId === data.workerId && a.date === data.date);
            if (existingIdx !== -1) {
              const updated = [...state.attendanceEntries];
              updated[existingIdx] = result;
              return { attendanceEntries: updated };
            } else {
              return { attendanceEntries: [...state.attendanceEntries, result] };
            }
          });
        } catch (err) {
          console.error('Upsert attendance failed:', err);
        }
      },

      // --- Progress ---
      addProgress: async (data) => {
        const id = `prog_${Date.now()}`;
        const newEntry = { id, ...data };
        try {
          await apiPost('/api/progress', newEntry);
          set((state) => ({ progressUpdates: [...state.progressUpdates, newEntry] }));
        } catch (err) {
          console.error('Add progress failed:', err);
        }
      },
      
      // --- Messaging ---
      sendDirectMessage: async (msgData) => {
        const id = `msg_${Date.now()}`;
        const newMsg = {
          id,
          type: 'direct',
          ...msgData,
          timestamp: new Date().toISOString(),
          readBy: [msgData.fromId], // sender has already "read" it
          replies: [],
        };
        try {
          await apiPost('/api/messages', newMsg);
          set((state) => ({ messages: [newMsg, ...state.messages] }));
        } catch (err) {
          console.error('Send direct message failed:', err);
        }
      },

      sendBroadcast: async (msgData) => {
        const id = `msg_${Date.now()}`;
        const newMsg = {
          id,
          type: 'broadcast',
          ...msgData,
          timestamp: new Date().toISOString(),
          readBy: [msgData.fromId],
          replies: [],
        };
        try {
          await apiPost('/api/messages', newMsg);
          set((state) => ({ messages: [newMsg, ...state.messages] }));
        } catch (err) {
          console.error('Send broadcast failed:', err);
        }
      },

      replyMessage: async (msgId, replyData) => {
        const { messages } = get();
        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;

        const reply = { id: `rep_${Date.now()}`, ...replyData, timestamp: new Date().toISOString() };
        const updatedReplies = [...(msg.replies || []), reply];
        
        try {
          await apiPut(`/api/messages/${msgId}`, { replies: updatedReplies });
          set((state) => ({
            messages: state.messages.map(m => m.id === msgId ? { ...m, replies: updatedReplies } : m)
          }));
        } catch (err) {
          console.error('Reply message failed:', err);
        }
      },

      markMessageRead: async (msgId, userId) => {
        const { messages } = get();
        const msg = messages.find(m => m.id === msgId);
        if (!msg || msg.readBy.includes(userId)) return;

        const updatedReadBy = [...msg.readBy, userId];
        try {
          await apiPut(`/api/messages/${msgId}`, { readBy: updatedReadBy });
          set((state) => ({
            messages: state.messages.map(m => m.id === msgId ? { ...m, readBy: updatedReadBy } : m)
          }));
        } catch (err) {
          console.error('Mark message read failed:', err);
        }
      },

      markAllRead: async (userId) => {
        const { messages } = get();
        const updates = messages.map(async (m) => {
          if (!m.readBy.includes(userId)) {
            const updatedReadBy = [...m.readBy, userId];
            try {
              await apiPut(`/api/messages/${m.id}`, { readBy: updatedReadBy });
            } catch (err) {
              console.error(err);
            }
          }
        });
        await Promise.all(updates);
        
        set((state) => ({
          messages: state.messages.map(m => !m.readBy.includes(userId) ? { ...m, readBy: [...m.readBy, userId] } : m)
        }));
      },

      deleteMessage: async (msgId) => {
        try {
          await apiDelete(`/api/messages/${msgId}`);
          set((state) => ({ messages: state.messages.filter(m => m.id !== msgId) }));
        } catch (err) {
          console.error('Delete message failed:', err);
        }
      },

      // --- Admin Documents ---
      addDocumentToUser: async (userId, document) => {
        const { users } = get();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const updatedDocuments = [...(user.documents || []), { ...document }];
        
        // Optimistically update UI
        set((state) => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, documents: updatedDocuments } : u
          )
        }));

        try {
          await apiPut(`/api/users/${userId}`, { documents: updatedDocuments });
        } catch (err) {
          console.error('Failed to sync document with MongoDB:', err);
        }
      },

      deleteDocumentFromUser: async (userId, docId) => {
        try {
          const { users } = get();
          const user = users.find(u => u.id === userId);
          if (!user) return;

          const updatedDocuments = user.documents.filter(d => d.id !== docId);

          await apiPut(`/api/users/${userId}`, { documents: updatedDocuments });

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
    }
  )
);

export default useStore;
