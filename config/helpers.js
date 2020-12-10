const MySqli = require('mysqli') // обновленная версия устаревшего MySQL расширения
let conn = new MySqli({
    host: 'localhost',
    post: 3306,
    user: 'Semiol',
    passwd: '1234',
    db: 'mega_shop'
});

let db = conn.emit(false, '' );

module.exports = {
    database: db
};
