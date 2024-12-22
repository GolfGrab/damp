import { useTypedParams } from "react-router-typesafe-routes";
import home from "../../routers/typesafe-routes";

const City = () => {
  const { city } = useTypedParams(home.concerts.city);
  return <div>City : {city}</div>;
};

export default City;
