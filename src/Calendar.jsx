import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import styles from './calendar.module.css'; 

const Calendar = () => {
  const [schedules, setSchedules] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const minimumDate = new Date();

  useEffect(() => {

    const requestBody = {
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(addDays(startDate, 6), 'yyyy-MM-dd')
    };
        
    const headers = {
      'apikey': 'IK-HJQT0XWDYA2I2B000NVD', 
      'Content-Type': 'application/json'
    };

    // Fetch slots using POST method
    axios.post('https://ikalas.com/api/v1/ik-slots', requestBody, {headers})
      .then(response => {
        // Process the response data to group by date
        const groupedSchedules = response.data.result.reduce((acc, schedule) => {
            const startDate = format(parseISO(schedule.start), 'yyyy-MM-dd');
            const startTime = format(parseISO(schedule.start), 'HH:mm');
            const endTime = format(parseISO(schedule.end), 'HH:mm');

            if (!acc[startDate]) {
              acc[startDate] = [];
            }
            acc[startDate].push(`${startTime} - ${endTime}`);

            return acc;
          }, {});

        setSchedules(groupedSchedules);
      })
      .catch(error => {
        console.error('Error fetching slots:', error);
      });
    }, [startDate]);

  // Handle previous and next week navigation
  const handlePrevWeek = () => {
    if (startDate > minimumDate) {
      setStartDate((prevDate) => addDays(prevDate, -7));
    }
  };

  const handleNextWeek = () => {
    setStartDate((prevDate) => addDays(prevDate, 7));
  };

  // Get dates for the current week
  const getWeekDates = (start) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
    return dates;
  };

  const weekDates = getWeekDates(startDate);

  return (
    <div className={styles.container}>
        {/* Left Arrow */}
        <button
          className={`${styles.arrow} ${styles.leftArrow} ${
            startDate <= minimumDate ? styles.disabledArrow : ''
          }`}
          onClick={handlePrevWeek}
          disabled={startDate <= minimumDate}
        >
          &lt;
        </button>

        {/* Right Arrow */}
        <button
          className={`${styles.arrow} ${styles.rightArrow}`}
          onClick={handleNextWeek}
        >
          &gt;
        </button>

        {/* Calendar Display */}
        <div className={styles.weekContainer}>
          {weekDates.map((date) => (
            <div key={date} className={styles.dayContainer}>
              <div className={styles.dayText}>
              {format(date, 'eee', { locale: fr }).replace(/\.$/, '')}<br/>
              <span>{format(date, 'dd MMM', { locale: fr }).replace(/\.$/, '')}</span>
              </div>
              {schedules[format(date, 'yyyy-MM-dd')] ? (
                schedules[format(date, 'yyyy-MM-dd')].map((time, index) => (
                  <div key={index} className={styles.scheduleContainer}>
                    <div className={styles.scheduleText}>{time}</div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      </div>
  );
};

export default Calendar;
