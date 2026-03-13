const firestore = () => ({
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
      update: async () => {},
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async () => {},
        }),
        where: () => ({
          limit: () => ({
            get: async () => ({ empty: true, docs: [] }),
          }),
        }),
        orderBy: () => ({
          get: async () => ({ docs: [] }),
        }),
      }),
    }),
  }),
  doc: () => ({
    get: async () => ({ exists: false, data: () => null }),
    set: async () => {},
    update: async () => {},
  }),
});

export default firestore;
