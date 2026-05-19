export const environment = {
  production: false,
  apiUrl: 'https://v4entertainment.azurewebsites.net',
  appName: 'Identity Service',
  identityUrl: 'http://localhost:55884', // Your identity service
  identityAPIUrl: 'https://localhost:7114', // Your identity service
  stripe: {
    testmode: true,
    publishableKey: 'pk_live_51Sd8PIF1Dtz3Qz6bNcA2zmuFlkxPCYoxN5VG3crZpmv6zSIFddHtW0ybqmJVCUuWjexz9EETvOcJySaeOvwGwYrW00oLkYHolM',
    testpublishableKey: 'pk_live_51Sd8PIF1Dtz3Qz6bNcA2zmuFlkxPCYoxN5VG3crZpmv6zSIFddHtW0ybqmJVCUuWjexz9EETvOcJySaeOvwGwYrW00oLkYHolM'
  }
};