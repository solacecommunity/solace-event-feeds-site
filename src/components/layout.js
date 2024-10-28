import React from 'react';
import PropTypes from 'prop-types';
import '../css/layout.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false; /* eslint-disable import/first */
import Resources from './resources';
import Header from './header';
import Footer from './footer';

const Layout = (props) => {
  return (
    <>
      <Header />
      <main>{props.children}</main>
      <Resources />
      <Footer />
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
