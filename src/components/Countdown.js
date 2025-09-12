import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

const Countdown = ({ launchHour = 22 }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
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
    <div className={styles.overlay}>
      <div className={styles.countdownBox}>
        <h1>Notre site sera lancé bientôt !</h1>
        <div className={styles.timer}>
          <div>
            <span>{timeLeft.hours}</span>
            <p>Heures</p>
          </div>
          <div>
            <span>{timeLeft.minutes}</span>
            <p>Minutes</p>
          </div>
          <div>
            <span>{timeLeft.seconds}</span>
            <p>Secondes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
