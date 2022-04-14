import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";

const MyApp = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

// useRouter().query の undefine 対策
MyApp.getInitialProps = async () => ({ pageProps: {} });

export default MyApp;
