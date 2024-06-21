import { LoadData as load } from "https://cdn.thefemdevs.com/assets/js/o/spotify";

await load('ben', '1158220643616182445');

setInterval(async () => await load('ben', '1158220643616182445'), 1e3);
