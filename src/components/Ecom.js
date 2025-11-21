import React, { useEffect, useState } from "react";
import logo from '../images/logo.jpeg';
import Slider from "react-slick";
import styles from './Ecom.module.css';
import Footer from "../components/Footer";
import slide1 from '../images/product1.jpg';
import slide2 from '../images/product2.jpg';
import slide3 from '../images/slide3.jpg';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BuyProduct from "./BuyProduct";
import product1 from '../images/product1.png';
import product2 from '../images/product2.png';
import product3 from '../images/product3.png';
import product4 from '../images/montre1.png';
import product5 from '../images/montre2.png';
import axios from "axios";

const Ecom = () => {
  const slides = [slide1, slide2, slide3];

  const [productDetailImg, setProductDetailImg] = useState('');
  const [productDetailPrice, setProductDetailPrice] = useState('');
  const [productDetailName, setProductDetailName] = useState('');
  const [productDescription, setProductDescription] = useState('');

  const [showForm, setShowForm] = useState(false);
  //const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3800,
    arrows: true,
    adaptiveHeight: true,
  };

  const productOne = {
    id: 1,
    productImg: product4,
    price: '13 000',
    name: 'G-Shock',
    description: "Les montres G-Shock sont des montres robustes et stylées, conçues pour résister aux chocs, à l’eau et aux conditions extrêmes tout en offrant un design moderne et sportif. Elles sont disponibles en toutes couleurs et aux prix forfaitaires de 13000f"
  };
  const productTwo = {
      id: 2,
      productImg: product1,
      price: '12 000',
      name: 'Gaecrolft',
      description: 'GAEGRLOF – Design Urbain & Confort Moderne. Affirme ton style avec ces sneakers GAEGRLOF au look audacieux ! Dotées d’une semelle épaisse et ergonomique, elles assurent un confort optimal tout au long de la journée. Leur design bicolore noir et blanc apporte une touche tendance et urbaine, parfaite pour les tenues streetwear. Le laçage épais et la finition soignée en font une paire à la fois stylée et résistante, idéale pour affronter la ville avec assurance.'
  };
  const productThree = {
    id: 3,
    productImg: product5,
    price: '17 000',
    name: 'Poedagar',
    description: "La montre Poedagar est un accessoire élégant et robuste conçu pour ceux qui recherchent un style luxueux à prix abordable. Avec son boîtier en acier inoxydable et son verre minéral résistant aux rayures, elle s’adapte aussi bien aux environnements professionnels qu’aux sorties décontractées. Son mouvement à quartz (ou automatique selon le modèle) assure une précision fiable au quotidien. Dotée d’un bracelet en cuir ou en métal, elle offre un confort optimal et un look soigné. Son affichage analogique, parfois accompagné d’un indicateur de date ou de jour, la rend pratique et esthétique. Enfin, grâce à son étanchéité 3ATM, elle résiste aux éclaboussures, mais il est préférable d’éviter l’immersion."
  };
  /*const productFour = {
      id: 4,
      productImg: 'https://dangoimport-server.onrender.com/images/sac1.png',
      price: '3 000',
      name: 'Sac à nattes',
      description: "Sac pour toute genre d'usage durable, pratique, jolie, tout pour votre confort . Vous permet d'être élégant lors de vos petites sorties ou lors d'un voyage. Vous disposez d'un large choix de couleurs et de motifs en plus des différents formats petit sac pour transporter vos affaires : 500f 700f 1000f 2000f sac en valise 3000f 5000f sac en forme de panier parfait pour ranger votre linge, vos affaires 3000f 4000f 5000f. N'hésitez pas à préciser vos préferences dans la description du formulaire d'achat"
  };
  const productFive = {
    id: 5,
    productImg: 'https://dangoimport-server.onrender.com/images/blueberry.png',
    price: "1-20 : 500 fcfa l'unité,  20- 50 : 300 fcfa l'unité, 50- 100 : 200 fcfa l'unité",
    name: 'PUQUIANNA',
      description: "Masque de visage Naturel hydratant, rend la peau douce, élimine les acnés, les imperfections, les peau mortes, antirides etc... disponible"
  };*/
  const products = [
    productOne,
    productTwo,
    productThree,
    //productFour,
    //productFive
  ]


  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <header>
        <div className={styles.headerNav}>
          <div>
            <div className={styles.logo}>
              <img src={logo} alt="logo" />
              <h3>Dango Import</h3>
            </div>
          </div>
        </div>
        <div className={styles.acceuil}>
          <div className={styles.texts}>
            <h1>Achetez les meilleurs produits de Dango Import</h1>
            <h2>
              Nous avons les meilleurs produits adaptés à vos besoins, commandez vos
              produits à un prix abordable
            </h2>
          </div>
          <div className={styles.sliderContainer}>
            <Slider {...settings} className={styles.slider}>
              {slides.map((s, i) => (
                <div key={i} className={styles.slideItem}>
                  <img
                    src={s}
                    alt={`slide-${i + 1}`}
                    className={styles.slideImage}
                    style={{ display: "block" }}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </header>

      <main>
        
        {!showForm && (
            <div className={styles.items}>
                <div>
                <div className={styles.productContainer}>
                    {/*loading && <p>Chargement...</p>*/}
                    {products && products.map((item) => (
                    <div className={styles.item} key={item.id || item._id}>
                        <img src={item.productImg} alt="productImg" />
                        <div>
                        <p>
                            {item.name} <span>{item.price} fcfa</span>
                        </p>
                        <p>
                            <button
                            onClick={() => {
                                setShowForm(true);
                                setProductDetailImg(item.productImg);
                                setProductDetailPrice(item.price);
                                setProductDetailName(item.name);
                                setProductDescription(item.description);
                            }}
                            >
                            Acheter
                            </button>
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
        )}

        {
            showForm && ( 
                <BuyProduct
                    image={productDetailImg}
                    name={productDetailName}
                    price={productDetailPrice}
                    description={productDescription}
                    isVisibled={setShowForm}
                />
            )
        }
      </main>

      <Footer />
    </div>
  );
};

export default Ecom;
