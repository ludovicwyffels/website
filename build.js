const spawn = require("cross-spawn");

const options = {
  optimisation: false
};

const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const option = arg.replace('--', '');
    options[option] = true;
  }
});

let baseURL = "/";
// Configure the base URL for deployment on CF Pageswith support of Preview environment
if (process.env.CF_PAGES_BRANCH === "main" || process.env.CF_PAGES_BRANCH === "master") {
  baseURL = "https://ludovicwyffels.dev/";
} else if (process.env.CF_PAGES_URL) {
  baseURL = process.env.CF_PAGES_URL;
}

console.log('Building ...')
console.log(`Using base URL: "${baseURL}"`);
cmd = spawn.sync(
  "hugo",
  ["--cleanDestinationDir", "--minify", "-b", baseURL],
  { encoding: "utf8" },
);

if (cmd.error) {
  console.log("ERROR: ", cmd.error);
}

console.log(cmd.stdout);
console.error(cmd.stderr);

if (options.optimisation) {
  console.log("Optimizes static websites");
  cmd = spawn.sync(
    "npx",
    ["@divriots/jampack", "./public"],
    { encoding: "utf8" },
  );
  
  if (cmd.error) {
    console.log("ERROR: ", cmd.error);
  }
  
  console.log(cmd.stdout);
  // console.error(cmd.stderr);
}


process.exit(cmd.status);