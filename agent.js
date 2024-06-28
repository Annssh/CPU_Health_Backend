import os from "os-utils";
import oss from "os";
import axios from "axios";
import si from "systeminformation";

const SERVER_URL = "http://localhost:3000/api/data";

const HOSTNAME = oss.hostname();
var IP_ADDRESS;
si.networkInterfaces().then((data) => (IP_ADDRESS = data[0].ip4));
// si.networkInterfaces("default").then((data) => (IP_ADDRESS = data.ip4));

const getCpuUsage = () => {
  return new Promise((resolve, reject) => {
    os.cpuUsage((v) => {
      resolve(v * 100); // Convert to percentage
    });
  });
};
var CPU_Speed;
const getCpuCurrentSpeed = async () => {
  const data = await si.mem();
  si.currentLoad().then((data) => (CPU_Speed = data?.currentLoad));
  return CPU_Speed;
};

var Avail_Ram;

const getAvailRam = async () => {
  const total = (await si.mem()).total;
  si.mem().then((data) => (Avail_Ram = data?.used));
  return (Avail_Ram * 100) / total;
};

var CPU_Temp;

const getCpuTemp = async () => {
  const data = await si.mem();
  si.cpuTemperature().then((data) => (CPU_Temp = data?.main));
  return CPU_Temp;
};

var Cache_Mem;

const getTotalCache = async () => {
  const data =
    ((await si.mem()).used - (await si.mem())?.active) / (1024 * 1024);
  Cache_Mem = -data;
  return Cache_Mem;
};

var Wifi_Quality;

const getWifiQuality = async () => {
  const data = (await si.wifiConnections())[0]?.quality;
  Wifi_Quality = data;
  if (Wifi_Quality === !undefined) {
    return 0;
  }
  return Wifi_Quality;
};

var Login_Time;

const getLoginTime = async () => {
  const data = (await si.users())[0]?.time;
  Login_Time = data;
  return Login_Time;
};

var Login_Date;

const getLoginDate = async () => {
  const data = (await si.users())[0]?.date;
  Login_Date = data;
  return Login_Date;
};
var Reboot_Time;

const getLastRebootTime = async () => {
  return new Promise(async (resolve, reject) => {
    const uptimeSeconds = await oss.uptime();
    if (uptimeSeconds === undefined) {
      reject("Error: Unable to retrieve uptime information.");
    } else {
      const currentTime = Date.now();
      const lastRebootTime = new Date(currentTime - uptimeSeconds * 1000);
      resolve(lastRebootTime);
    }
  });
};
function formatUptimeDuration(lastRebootTime) {
  const now = new Date();
  const diffMilliseconds = now - lastRebootTime;

  const seconds = Math.floor(diffMilliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"}, ${hours} hour${
      hours === 1 ? "" : "s"
    }, ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else if (hours > 0) {
    return `${hours} : ${minutes % (hours * 60)}  ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else {
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  }
}

// getLastRebootTime()
//   .then((lastRebootTime) => {
//     const formattedDuration = formatUptimeDuration(lastRebootTime);
//     Reboot_Time = formattedDuration;
//   })
//   .catch((error) => {
//     console.error("Error getting last reboot time:", error);
//   });

if (getCpuCurrentSpeed() == null || getCpuCurrentSpeed() == undefined) {
  CPU_Speed = 0;
}
if (getCpuTemp() == null || getCpuTemp() == undefined) {
  CPU_Temp = 0;
}

const sendData = async () => {
  while (true) {
    try {
      const [
        cpuUsage,
        cpu_speed,
        avail_ram,
        cpu_temp,
        wifi_quality,
        login_time,
        login_date,
        cache_mem,
        reboot_time,
      ] = await Promise.all([
        getCpuUsage(),
        getCpuCurrentSpeed(),
        getAvailRam(),
        getCpuTemp(),
        getWifiQuality(),
        getLoginTime(),
        getLoginDate(),
        getTotalCache(),
        getLastRebootTime()
          .then((lastRebootTime) => {
            const formattedDuration = formatUptimeDuration(lastRebootTime);
            Reboot_Time = formattedDuration;
            return Reboot_Time;
          })
          .catch((error) => {
            console.error("Error getting last reboot time:", error);
          }),
      ]);
      const data = {
        hostname: HOSTNAME,
        ip_address: IP_ADDRESS,
        cpu_usage: Math.round(cpuUsage),
        cpu_speed: Math.round(cpu_speed),
        avail_ram: Math.round(avail_ram),
        cpu_temp: cpu_temp,
        wifi_quality: wifi_quality,
        login_time: login_time,
        login_date: login_date,
        cache_mem: Math.round(cache_mem),
        reboot_time: reboot_time,
      };
      await axios.post(SERVER_URL, data);
      console.log(`Data sent: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error(`Error sending data: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the interval as needed
  }
};

sendData();
