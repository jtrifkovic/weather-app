import './DailyTemperature.scss';

const DailyTemperature = ({ day, avgTemp }) => {
  return (
    <div className='dailyTempWrapper'>
      <h4 className='day'>{day}</h4>
      <h5 className='temp'>{avgTemp}°C</h5>
    </div>
  );
};

export default DailyTemperature;
