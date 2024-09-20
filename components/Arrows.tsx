import React, { Component } from 'react';
import { StyleSheet, View, Image, Dimensions, PanResponder } from 'react-native';

// window dimensions
const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
// arrow dimensions
const length = 24;
const BOW_X = WINDOW_WIDTH / 2 - (length / 2);
const BOW_Y = WINDOW_HEIGHT * 4 / 5;
// arrow lifecycle
const LC_WAITING = 0;
const LC_STARTING = 1;

interface ArrowProps {
  length: number;
  lifecycle: number;
  onStart: (angle: number, dy: number) => void;
  type: 'a' | 'b' | 'c';
}

interface ArrowState {
  rotate: number;
  x: number;
  y: number;
}

class Arrow extends Component<ArrowProps, ArrowState> {
  constructor(props: ArrowProps) {
    super(props);
    this.state = {
      rotate: 0,
      x: BOW_X,
      y: BOW_Y,
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderMove: (e, gestureState) => {
        if (this.props.lifecycle === LC_WAITING) {
          let nextState = { ...this.state };
          this.pull(nextState, gestureState);
          this.rotate(nextState, gestureState.moveX, gestureState.moveY);
          this.setState(nextState);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (this.props.lifecycle === LC_WAITING) {
          this.props.onStart(this.state.rotate, gestureState.dy);
        }
      },
    });
  }

  rotate(nextState: ArrowState, x: number, y: number) {
    let dx = x - BOW_X - this.props.length / 2;
    let dy = BOW_Y - y;
    let angle = Math.atan2(dx, dy) * 180 / Math.PI;
    nextState.rotate = angle - 180;
  }

  pull(nextState: ArrowState, gestureState: any) {
    if (gestureState.dy > 0 && gestureState.dy < 50) {
      nextState.y = BOW_Y + gestureState.dy;
    }
  }

  updatePosition(state: any) {
    let nextState = { ...this.state };
    nextState.x = this.state.x + state.vx;
    nextState.y = this.state.y + state.vy;
    this.setState(nextState);
  }

  restart() {
    this.setState({
      rotate: 0,
      x: BOW_X,
      y: BOW_Y,
    });
  }

  render() {
    return (
      <View
        {...this.panResponder.panHandlers}
        style={[styles.arrowContainer, {
          width: this.props.length,
          height: this.props.length * 1.5,
          left: this.state.x,
          top: this.state.y,
          transform: [
            { rotate: this.state.rotate + 'deg' }
          ]
        }]}
      >
        <Image
          renderToHardwareTextureAndroid
          source={require('../img/arrow.png')}
          style={[{
            width: this.props.length,
            height: this.props.length * 1.5,
            backgroundColor: 'transparent'
          }]}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  arrowContainer: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

export default Arrow;
