const MinistryPlatformAPI = {
  async request (requesturl, path, query = {}, body = {}) {
    return fetch(`${requesturl}/api/widgets`, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path,query,body })
    })
      .then(response => response.json())
      .catch(() => {
        throw new Error('Failed to load request');
      })
  }
}

export default MinistryPlatformAPI;