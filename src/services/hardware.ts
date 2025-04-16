import { ReadlineParser, SerialPort } from 'serialport';
import { DefaultConfig, GlobalConfig } from '../models/config';
import { ConfigManager } from '../store/configManager';

export class Hardware {

    public port: SerialPort | undefined;
    public parser: ReadlineParser | undefined;
    public canRing: boolean = true;

    private currentDevice: string | undefined;

    public async searchDevice() {
        const devices = await SerialPort.list();
        this.currentDevice = devices.find((v) => v.vendorId !== undefined)?.path;
    }

    public printDevice() {
        console.log(this.currentDevice);
    }

    public init() {
        let mainConfig = ConfigManager.deserialize<GlobalConfig>("GlobalConfig");
        if (mainConfig === undefined) {
            mainConfig = DefaultConfig;
        }
        this.port = new SerialPort({ path: this.currentDevice as string, baudRate: mainConfig.baudRate }).setEncoding('utf-8');
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
    }
}