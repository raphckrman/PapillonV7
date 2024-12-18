import pronote from "pawnote";
import datasets from "../../consts/datasets.json";

const getInstancesFromDataset = async (longitude: number, latitude: number):Promise<pronote.GeolocatedInstance[]> => {
  let adress_api_fetch = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}&limit=1`);
  try {
    let adress_api = await adress_api_fetch.json();
    if (adress_api.features.length === 0) {
      return [];
    }
    const postcode = adress_api.features[0].properties.postcode;
    let instances_fetch = await fetch(datasets.establishment.replace("[postcode]", postcode));
    try {
      let instances = await instances_fetch.json();
      return instances.map((instance: any) => {
        let distance = Math.sqrt(
          Math.pow(instance.lat - latitude, 2) + Math.pow(instance.long - longitude, 2)
        );
        return {
          name: instance.name.toUpperCase(),
          url: instance.url,
          distance: distance,
          longitude: instance.long,
          latitude: instance.lat,
        };
      });
    } catch (error) {
      return [];
    }
  } catch (error) {
    console.error(error);
  }
};

export default getInstancesFromDataset;