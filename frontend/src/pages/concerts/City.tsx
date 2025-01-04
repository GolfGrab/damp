import { useParams } from "react-router-dom";

const City = () => {
  const { city } = useParams();
  return <div>City : {city}</div>;
};

export default City;
