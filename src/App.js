import './App.scss';
import Countries from './components/Countries/Countries';
import { useMemo, useState } from 'react';
import { BiSearchAlt2 } from 'react-icons/bi';
import weather from './assets/img/cloudy.png';
import { WEATHER_API_KEY, WEATHER_API_URL } from './api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DailyTemperature from './components/DailyTemperature/DailyTemperature';

const weekday = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
];

const getTempsPerDay = (list) =>
  list
    .map(({ main, dt_txt }) => ({
      date: new Date(dt_txt),
      day: weekday[new Date(dt_txt).getDay()],
      tempData: main
    }))
    .reduce((groups, item) => {
      const group = groups[item.day] || [];
      group.push(item);
      groups[item.day] = group;
      return groups;
    }, {});

const getAverageTempPerDay = (day, tempsPerDay) => {
  const sum = tempsPerDay[day]
    .map(({ tempData }) => tempData.temp)
    .reduce((a, b) => a + b, 0);
  return Math.round(sum / tempsPerDay[day].length) || 0;
};

const getAverageTempPerWeek = (tempsPerDay) => {
  const sum = tempsPerDay
    .map(({ avgTemp }) => avgTemp)
    .reduce((a, b) => a + b, 0);
  return Math.round(sum / tempsPerDay.length) || 0;
};

const App = () => {
  const [{ country, city }, setData] = useState({
    country: 'NL',
    city: ''
  });

  const [avgTempPerDays, setAvgTempPerDays] = useState([]);
  const [avgTempPerWeek, setAvgTempPerWeek] = useState();
  const [range, setRange] = useState();

  const [magnifer, setMagnifer] = useState(false);

  const handleCountryChange = (event) => {
    setData((data) => ({ ...data, country: event.target.value }));
  };

  const handleChange = (event) => {
    setData((data) => ({ ...data, city: event.target.value }));
  };

  const getDateRange = (from, to) => {
    const monthFrom = new Date(from).toLocaleString('en-us', {
      month: 'short'
    });

    const monthDayFrom = new Date(from).toLocaleString('en-us', {
      month: 'short',
      day: 'numeric'
    });

    const monthTo = new Date(to).toLocaleString('en-us', {
      month: 'short'
    });

    const dayTo = new Date(to).toLocaleString('en-us', {
      day: 'numeric'
    });

    const yearTo = new Date(to).toLocaleString('en-us', {
      year: 'numeric'
    });

    const toLabel = monthFrom !== monthTo ? monthTo + ' ' + dayTo : dayTo;
    setRange(monthDayFrom + ' - ' + toLabel + ' ' + yearTo);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?appid=${WEATHER_API_KEY}&q=${city},${country}&units=metric`
      );
      const { list } = await response.json();
      getDateRange(list[0].dt_txt, list[list.length - 1].dt_txt);

      const tempsPerDay = getTempsPerDay(list);

      const avgTempsPerDay = Object.keys(tempsPerDay).map((day) => ({
        day: day,
        avgTemp: getAverageTempPerDay(day, tempsPerDay)
      }));

      const avgTempPerAllDays = getAverageTempPerWeek(avgTempsPerDay);

      setAvgTempPerDays(avgTempsPerDay);
      setAvgTempPerWeek(avgTempPerAllDays);
    } catch (e) {
      toast.error(
        'Uneseni grad ne postoji u ovoj drzavi. Molimo unesite ispravan grad!'
      );
    }
  };

  const calculateGradient = useMemo(() => {
    let color = '';

    switch (true) {
      case avgTempPerWeek > -15 && avgTempPerWeek <= 0:
        color =  'rgba(50, 97, 214, 0.4)';
        break;
      case avgTempPerWeek > 1 && avgTempPerWeek <= 15:
        color = 'rgba(6, 153, 194, 0.8)';
        break;
      case avgTempPerWeek > 16 && avgTempPerWeek <= 25:
        color = 'rgba(255, 288, 0, 1)';
        break;
      case avgTempPerWeek > 26:
        color = 'rgba(242, 187, 0, 1)';
        break;
      default:
        color = 'rgba(230, 218, 48, 0.4)';
        break;
    }

    return color;
  }, [avgTempPerWeek]);

  return (
    <div
      className='mainContainer container'
      style={{ backgroundColor: calculateGradient }}
    >
      <div className='content'>
        <form onSubmit={handleSubmit}>
          <div className='searchContainer'>
            <img className='img' alt='weather' src={weather} />
            <Countries handleCountryChange={handleCountryChange} />
            <>
              <input
                className='searchBox'
                type='text'
                name='city'
                placeholder='Please enter your location...'
                onChange={handleChange}
                onFocus={setMagnifer}
              />{' '}
              <BiSearchAlt2
                className={'biSearch goOut' + (magnifer ? 'active' : '')}
              />
            </>
          </div>
        </form>
      </div>
      {avgTempPerWeek && (
        <div className='avgTempWeek'>
          <span className='avgTempWeekRange'>{range}</span>
          <h1>{avgTempPerWeek}°C</h1>
        </div>
      )}
      <div className='avgDays'>
        {avgTempPerDays.map(({ i, day, avgTemp }) => (
          <DailyTemperature key={day} day={day} avgTemp={avgTemp} />
        ))}
      </div>
      <ToastContainer
        position='top-center'
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App;
