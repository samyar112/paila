const functions = () => ({
  httpsCallable: (_name: string) => async (_data: unknown) => ({
    data: {
      temperature: -15,
      condition: 'Snow',
      windSpeed: 25,
    },
  }),
});
export default functions;
