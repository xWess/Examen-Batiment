const mongo = require("mongoose"); // hedhi kima بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
const Schema = mongo.Schema; // hedhi kima الحمد لله رب العالمين
const Batiment = new Schema({
  nom: String,
  nbr_niveau: Number,
  description: String,
  adress: String,
});
module.exports = mongo.model("batiment", Batiment); // hedhi kima وَالصَّلَاةُ وَالسَّلاَمُ عَلَىٰ رَسُولِ اللَّهِ

