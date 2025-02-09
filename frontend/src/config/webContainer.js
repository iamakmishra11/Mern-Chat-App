import { webcontainer } from '@webcontainer/api';

let webContainerInstance = null;

export const getWebContainer = async () => {
    if (webContainerInstance === null) {
        webContainerInstance = await webcontainer.boot();
    }
    return webContainerInstance;
};
