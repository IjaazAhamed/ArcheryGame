import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

class Detail extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailContained}>
          <Text style={styles.detailStyle}> Selected Arrow : {this.props.selectedArrow}</Text>
        </View>
        <View style={[styles.detailContained, styles.windContainer]}>
        <Text style={[styles.detailStyle]} >Wind Direction </Text>
          <Image renderToHardwareTextureAndroid
          source={require('../img/arrow.png')} style={[{
          width: 24,
          height: 24,
          backgroundColor: 'transparent',
          transform: [
            {rotate: this.props.windAngle + 'deg'},
          ]
          }]} resizeMode={'contain'}/>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  detailContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailContained: {
    flex: 1,
  },
  detailStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#707070',
  },
  windContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowImage: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
  },
});

export default Detail;
