import { useEffect, useState } from "react";
import styles from "./Countdown.module.css"; 
import logo from '../images/logo.jpeg';

const Countdown = ({ launchHour = 22 }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [showCountdown, setShowCountdown] = useState(true);

  const calculateTimeLeft = () => {
    const now = new Date();
    const launchDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      launchHour, 0, 0
    );

    const difference = launchDate - now;

    if (difference <= 0) {
      setShowCountdown(false);
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchHour]);

  if (!showCountdown) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-box">
        <h1>Notre site sera lancé bientôt !</h1>
        <div className="timer">
          <div className="time-section">
            <span>{timeLeft.hours ?? 0}</span>
            <p>Heures</p>
          </div>
          <div className="time-section">
            <span>{timeLeft.minutes ?? 0}</span>
            <p>Minutes</p>
          </div>
          <div className="time-section">
            <span>{timeLeft.seconds ?? 0}</span>
            <p>Secondes</p>
          </div>
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
            <h3>Dango Import</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
