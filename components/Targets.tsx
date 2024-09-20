import React, { Component } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import PropTypes from 'prop-types';

class Target extends Component {
  render() {
    const { x, y, radius, isHit,targetKey } = this.props;    

    const targetImage = isHit 
      ? require('../img/bullseye_green.png')
      : require('../img/bullseye_red.png'); 

    return (
      <View style={{ position: 'absolute', left: x, top: y }}>
        <Image
          source={targetImage}
          style={{
            height: radius * 2,
            width: radius * 2,
          }}
        />
        <Text style={styles.keyText}>{`${targetKey + 1}`}</Text>
        </View>
    );
  }
}

Target.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  isHit: PropTypes.bool,
  targetKey:PropTypes.number
};

Target.defaultProps = {
  isHit: false,
};

const styles = StyleSheet.create({
  targetImage: {
    resizeMode: 'contain',
  },
  keyText: {
    textAlign: 'center',
    marginTop: 5,       
    fontSize: 16,
    color: '#000',
  },
});

export default Target;
