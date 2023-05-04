import express from "express";
import bodyparser from "body-parser";
import jwt from "jsonwebtoken";
import redis from "redis";

const JWT_SECRET = "çok-gizli-bilgi";

const app = express();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

let client = null;
//Redis bağlantısı
(async () => {
  client = redis.createClient();

  client.on("error", (error) => {
    console.log(error);
  });
  client.on("connect", () => {
    console.log("Redis bağlantısı kuruldu!");
  });

  await client.connect();
})();

const tokenDogrula = async (request, response, next) => {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
//Token var mı yok mu?
  if (token == null) {
    return response.status(401).send({
      message: "Token girilmedi!",
    });
  }
//Token kara listede mi?
  const karaListedeMi = await client.get(`bl_${token}`);
  if (karaListedeMi) {
    return response.status(401).send({
      message: "Token kara listede",
    });
  }
//Token geçerli mi?
  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return response.status(401).send({
        status: "error",
        message: error.message,
      });
    }
    request.kullaniciID = user.kullaniciadi;
    request.tokenGecerlilikSuresi = user.exp;
    request.token = token;
    next();
  });
};
//kayitol yolu. POST isteği ile token üretiliyor.
app.post("/kayitol", (request, response) => {
  const token = tokenUret({ kullaniciadi: request.body.kullaniciadi});
  response.json(token);
});

//Anasayfa yolu. GET isteği ile girilen token doğrulanarak cevap veriliyor.
app.get("/", tokenDogrula, (request, response) => {
  return response.status(200).send("Doğrulama Başarılı!");
});
//cikisyap yolu. POST isteği ile çıkış yapılarak üretine JWT Redis'te tutulan kara listeye ekleniyor.
app.post("/cikisyap", tokenDogrula, async (request, response) => {
  const { kullaniciID, token, tokenGecerlilikSuresi } = request;
  const token_key = `bl_${token}`;
  await client.set(token_key, token);
  client.expireAt(token_key, tokenGecerlilikSuresi);
  return response.status(200).send("Token geçersiz hale getirildi!");
});

const tokenUret = (kullaniciadi) => {
  return jwt.sign(kullaniciadi, JWT_SECRET, { expiresIn: "3600s" });
};

const listener = app.listen(3000, () => {
  console.log("Sunucu dinlemede!");
});
