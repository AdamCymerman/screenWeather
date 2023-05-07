var chart;

function fetchWeatherData() {


  if (chart) {
    // chart instance already exists, destroy it
    chart.destroy();
  }
  console.log("run")
  console.log("")

  const API_KEY = '';
  const CITY = 'lafayette Indiana';
  const COUNTRY_CODE = 'us';
  let currentTimeLine = null;


  const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${CITY},${COUNTRY_CODE}&days=1&aqi=no&alerts=no`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const hourlyForecast = data.forecast.forecastday[0].hour;

      const temperatureData = hourlyForecast.map(forecast => forecast.temp_f);
      const rainData = hourlyForecast.map(forecast => forecast.chance_of_rain);
      
      // add a 100 point to ensure the chart goes up to 100 on the y-axis
      temperatureData.push(100.1);

      const currentHour = new Date().getHours();
      const chartData = {
        labels: hourlyForecast.map(forecast => {
          const date = new Date(forecast.time);
          const options = { hour: 'numeric', minute: 'numeric', hour12: true };
          return date.toLocaleString('en-US', options);
        }),
        
        datasets: [
          {
            label: 'Temperature (°F)',
            data: temperatureData,
            borderColor: '#FF6347',
            pointBackgroundColor: hourlyForecast.map(forecast => {
              const date = new Date(forecast.time);
              return date.getHours() === currentHour ? '#FF6347' : '#FFFFFF';
            })
          },
          {
            label: 'Chance of Rain (%)',
            data: rainData,
            borderColor: '#1E90FF',
            pointBackgroundColor: hourlyForecast.map(forecast => {
              const date = new Date(forecast.time);
              return date.getHours() === currentHour ? '#1E90FF' : '#FFFFFF';
            })
          },
        ]
      };

      
      const currentTemperature = temperatureData[currentHour];    
      const rainChance = rainData[currentHour];  
            
      // Get the max rain        
      const maxRain = Math.max(...rainData);
      const maxRainIndex = rainData.indexOf(maxRain);
      const maxRainTime = new Date(hourlyForecast[maxRainIndex].time).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true});   
      let rainString = ""
      if (maxRain === 0)
      {
        rainString = ""
      }
      else
      {
        rainString = `Max Rain: ${maxRain}% (${maxRainTime})`
      }


      // Get the max temperature        
      const minTemperature = Math.min(...temperatureData);
      const temperatureDataExcluding100 = temperatureData.filter(temp => temp !== 100.1); //need to take out 100.1 because thats the value put it to make the graph go up to 100 on the y axis
      const maxTemperature = Math.max(...temperatureDataExcluding100);

      const oyOffset = 7

      if (maxRain > maxTemperature)
      {
        yOffset = oyOffset + maxRain
      } else {
        yOffset = oyOffset + maxTemperature
      }

      fontSize = 20
      fontWeight = 'bold'

      const chartPlugins = {
        annotation: {
          annotations: {
            label1: {
              type: 'label',
              xValue: new Date().getHours(),
              yValue: yOffset + 3,
              backgroundColor: 'rgba(0,0,0,0)',
              color: ['#FF6347'],
              content: [`Temperature: ${currentTemperature.toFixed(0)}°F`],
              font: {
                size: fontSize,
                weight: fontWeight
              }
            },
            ...(rainChance > 0 && {
              label2: {
                type: 'label',
                xValue: new Date().getHours(),
                yValue: yOffset,
                backgroundColor: 'rgba(0,0,0,0)',
                color: ['#1E90FF'],
                content: [`Rain: ${rainChance.toFixed(0)}%`],
                font: {
                  size: fontSize,
                  weight: fontWeight
                }
              },
            })
          }
        }
      };

      const chartOptions = {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [{
            label: 'Sales',
            data: [100, 200, 150, 300, 200, 250, 400],
            borderColor: 'blue',
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Sales Report'
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              ticks: {
                beginAtZero: true
              }
            }
          },
          plugins: {
            annotation: chartPlugins.annotation
          }
        }
      };

      //
      let ctx = document.getElementById('chart').getContext('2d');
      chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: Object.assign(chartOptions, {plugins: chartPlugins})
      });
      // add an event listener to the chart object that is triggered when the chart is fully loaded
      chart.options.animation.onComplete = function() {
      };



        const weatherStats = document.getElementById('weather-stats');

        weatherStats.innerHTML = `Max: ${maxTemperature}°F | Min: ${minTemperature}°F<br>${rainString}`;
        
    })



    
}
//run every hour
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// run every hour
async function updateWeatherData() {
  while(true) {
    await fetchWeatherData();
    await sleep(60 * 15 * 1000);
   // await sleep(5 *1000)
  }
}

updateWeatherData()
