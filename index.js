import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
const app = express();
app.use(helmet());

// Enable CORS with specific configuration
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  // console.log(`Request Method: ${req.method}`);
  // console.log(`Request Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Ensure preflight requests are handled
app.options("*", cors(corsOptions));
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.json());
// Implement CSP to prevent XSS attacks by specifying allowed sources of content.
// Set security headers

// Enable CORS with specific configuration

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// const IP_ADDRESS = "192.168.29.147";

let cpuData = [];
app.post("/api/data", (req, res) => {
  const {
    hostname,
    ip_address,
    cpu_usage,
    cpu_speed,
    avail_ram,
    cpu_temp,
    wifi_quality,
    login_time,
    login_date,
    cache_mem,
    reboot_time,
  } = req.body;
  cpuData.push({
    hostname,
    ip_address,
    cpu_usage,
    cpu_speed,
    avail_ram,
    cpu_temp,
    wifi_quality,
    login_time,
    login_date,
    cache_mem,
    reboot_time,
    timestamp: new Date(),
  });

  res.sendStatus(200);
});

app.get("/api/monitor", (req, res) => {
  res.json(cpuData);
});

app.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});
