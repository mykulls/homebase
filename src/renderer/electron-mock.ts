export const ipcRenderer = {
  on: () => {},
  send: () => {},
  invoke: () => Promise.resolve(),
};

export const shell = {
  openExternal: () => Promise.resolve(),
};
