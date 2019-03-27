
// The following short JSON file called "data.json" is parsed 
// in the code below. It must be in the project's "data" folder.
//
// {
//   "id": 0,
//   "species": "Panthera leo",
//   "name": "Lion"
// }

JSONObject json;
JSONObject json2;
float max = 28.700000762939453;

void setup() {
  size(360, 181);
  json = loadJSONObject("./../gfs.json");
  json2 = loadJSONObject("./../gfs2.json");

  //int id = json.getInt("nx");
  //int species = json.getInt("ny");
  //String name = json.getString("data");


  JSONArray data = json.getJSONArray("data");
  JSONArray data2 = json2.getJSONArray("data");

  println(data.size());
  //println(data);
  loadPixels();
  for (int i = 0; i < data.size(); i++) {
    println(data.getFloat(i));
    //println(data.getJSONArray(i).getFloat(0));
    //float tempR = map(data.getJSONArray(i).getFloat(0), -max, max, 0, 255);
    //float tempG = map(data.getJSONArray(i).getFloat(1), -max, max, 0, 255);
    float tempR = map(data.getFloat(i), -max, max, 0, 255);
    float tempG = map(data2.getFloat(i), -max, max, 0, 255);
    pixels[i] = color(tempR, tempG, 0);
  }
  updatePixels();
  saveFrame("rg.png");
  noLoop();
}

// Sketch prints:
// 0, Panthera leo, Lion
