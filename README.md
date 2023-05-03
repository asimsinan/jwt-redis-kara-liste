# Redis JWT Kara Listeleme

1. İşletim sisteminize uygun [Redis](https://redis.io/download/) versiyonunu kurun.
2. `npm install` komutu ile uygulama bağımlılıklarını yükleyin.
3. `redis-server` komutuyla Redis sunucusunu ayrı bir terminalde çalıştırın.
4. `npm start` komutu ile uygulamanızı çalıştırın.
5. `/kayitol` API yoluna POST isteği göndererek JWT üretin.
6. `http://localhost:3000/` adresine `Authorization: Bearer <JWT>` parametresiyle bir önceki aşamada ürettiğniz JWT ile GET isteği gönderin. Thunder Client kullanıyorsanız Auth->Bearer kısmına Bearer Token alanına JWT'yi yazabilirsiniz.
7. `/cikisyap` API yoluna POST isteği gönderdiğinizde JWT kara listeye eklenecek.
7. Tekrar daha önce ürettiğiniz JWT ile `http://localhost:3000/` adresine GET isteği gönderdiğinizde JWT kara listede olduğu için kimlik doğrulama başarısız olacaktır.
