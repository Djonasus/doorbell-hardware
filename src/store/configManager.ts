import * as fs from 'fs';

export class ConfigManager {
    // private config: any = {};

    static serialize(filename: string, config: any) {
        fs.writeFileSync("./configs/"+filename+".json", JSON.stringify(config, null, 4));
    }

    static deserialize<T>(filename: string): T|undefined {
        try {
            return JSON.parse(fs.readFileSync("./configs/"+filename+".json", 'utf8')) as T;   
        } catch (error) {
            console.error(`Error reading or parsing JSON file: ${error}`);
            return undefined;
        }
    }
}