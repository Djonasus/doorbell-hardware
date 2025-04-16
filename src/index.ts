import { pressButton } from './services/pressBtn';
import { Hardware } from './services/hardware';


async function main() {
  const device = new Hardware;

  await device.searchDevice();
  device.init();

  device.port?.on("open", () => {
    console.log('serial port open');
    const startup = Buffer.from('startup', 'utf8');
    setTimeout(() => {
      device.port?.write(startup, (err) => {
        if (err) {
          console.error('Error writing to serial port:', err);
        }
      });
    }, 1000);
  });

  device.parser?.on('data', async data =>{
    data = data.replace(/(\r\n|\n|\r)/gm, "");
    if (device.canRing) {
      device.canRing = false;
      device.port?.write("send");
      console.log('got word from arduino:', data);
  
      await pressButton(sendMessage, data);
  
      setTimeout(() => device.canRing = true, 3000);
    }
  });

  const sendMessage = (mess: string) => {
    setTimeout(() => {
      device.port?.write(mess);
    }, 180);
  }
}

main();