import spawn from "child_process";


temp = spawn("cat", ["/sys/class/thermal/thermal_zone0/temp"]);

temp.stdout.on("data", function (data) {
  console.log("Result: " + data / 1000 + " degrees Celcius");
});
