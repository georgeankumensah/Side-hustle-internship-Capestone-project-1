var fs = require("fs");
var http = require("http");
const si = require("systeminformation");

const errpage = fs.readFileSync(__dirname + "/pages/404.html");

http
  .createServer(async (req, res) => {
    const getOSInfo = async () => {
      var osInfo = await si.osInfo();
      var cpu = await si.cpu();
      var networkInterfaces = await si.networkInterfaces();
      return {
        hostname: osInfo.hostname,
        platform: osInfo.platform,
        architecture: osInfo.arch,
        numberOfCPUS: cpu.processors,
        networkInterfaces: networkInterfaces,
        uptime: si.time().uptime,
      };
    };

    if (req.url === "/sys") {
      const osinfo = await getOSInfo();
      const data = JSON.stringify(osinfo);
      fs.writeFile("osinfo.json", data, (err) => {
        if (err) {
          res.writeHead(404, { "Content-type": "text/plain" });
          res.end("There was an error saving your data");
          return;
        }
        res.writeHead(201, { "Content-type": "text/plain" });
        res.end("Your OS info has been saved successfully!");
      });

      return;
    }

    var page =
      req.url === "/" || req.url === "/index"
        ? "/index.html"
        : req.url + ".html";
    fs.readFile(__dirname + "/pages" + page, function (err, data) {
      if (err) {
        res.writeHead(404);
        res.end(errpage);
        return;
      }
      res.writeHead(200, { "Content-type": "text/html" });
      res.end(data);
    });
  })
  .listen(5000, () => {
    console.log("Listening on port 5000");
  });
