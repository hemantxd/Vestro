import dns from "node:dns/promises";

(async () => {
  try {
    const result = await dns.lookup(
      "ep-wild-sunset-at7vtb7d.c-9.us-east-1.aws.neon.tech"
    );
    console.log(result);
  } catch (err) {
    console.error(err);
  }
})();
