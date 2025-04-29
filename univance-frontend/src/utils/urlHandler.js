export const createURLConverter = (prefix) => {
  return (path, params) => {
    // Convert path and params to URL
    let url = `${prefix}/${path}`;
    if (params) {
      const queryParams = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      url += `?${queryParams}`;
    }
    return url;
  };
};