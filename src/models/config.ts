export type GlobalConfig = {
    hostAddress: string,
    serialPort: string,
    baudRate: number,
    // photosDir: string,
    // cameraDevice: string,
}

export const DefaultConfig: GlobalConfig = {
    hostAddress: "http://localhost:8000",
    serialPort: "/dev/cu.usbserial-2230", //"/dev/ttyUSB0",
    baudRate: 9600,
    // photosDir: "./photos",
    // cameraDevice: "/dev/video0", 
}