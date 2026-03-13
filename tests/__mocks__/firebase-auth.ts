const auth = () => ({
  currentUser: { uid: 'test-user-123' },
  onAuthStateChanged: (cb: (user: unknown) => void) => {
    cb({ uid: 'test-user-123' });
    return () => {};
  },
});
export default auth;
