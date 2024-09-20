import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, Dimensions, TouchableOpacity ,Alert, Image } from 'react-native';
import Arrow from './components/Arrows';
import Target from './components/Targets';
import Detail from './components/Details';
import AsyncStorage from '@react-native-async-storage/async-storage';

// window dimensions
const WINDOW_HEIGHT = Dimensions.get('window').height;
const WINDOW_WIDTH = Dimensions.get('window').width;
// target dimensions
const TARGET_RADIUS = 24;
const TARGET_Y = WINDOW_HEIGHT / 8;
const length = 24;
// arrow lifecycle
const LC_WAITING = 0;
const LC_STARTING = 1;

class Archery extends Component {
  constructor(props) {
    super(props);
    this.arrowRef = React.createRef();
    this.interval = null;
    this.state = {
      loading: true,
      vx: 0,
      vy: 0,
      lifecycle: LC_WAITING,
      scored: null,
      score: 0,
      targets: [
        { id: 1, isHit: false },
        { id: 2, isHit: false },
        { id: 3, isHit: false },
      ],
      selectedArrow: null,
      showingSelection: true,
      highScore: 0,
      windSpeed: 0,
      windAngle: 0,
    };
    this.generateWind(this.state);

    AsyncStorage.getItem('highScore').then((d) => {
      let nextState = Object.assign({}, this.state);
      if (d) {
        nextState.highScore = JSON.parse(d).highScore;
      } else {
        nextState.highScore = 0;
      }
      nextState.loading = false;
      this.setState(nextState);
    });
  }

  componentDidMount() {
    this.interval = setInterval(this.update.bind(this), 1000 / 60);
    this.setState({ targets: this.generateTargets() });
  }

  generateTargets() {
    const numberOfTargets = 3;
    const targets = [];
    const fixedY = TARGET_Y;
    
    for (let i = 0; i < numberOfTargets; i++) {
      targets.push({
        id: i,
        x: (WINDOW_WIDTH / numberOfTargets) * i + (WINDOW_WIDTH / numberOfTargets / 2) - TARGET_RADIUS,
        y: fixedY,
        radius: TARGET_RADIUS,
        type: String.fromCharCode(65 + i),
        isHit: false,
      });
    }    
    return targets;
  }
  
  
  update() {
  if (this.state.lifecycle === LC_WAITING) return;

  if (this.arrowRef.current) {
    let nextState = Object.assign({}, this.state);
    this.arrowRef.current.updatePosition(this.state);
    this.updateVelocity(nextState);
    this.handleCollision(nextState);
    this.handleRestart(nextState);
    this.setState(nextState);
  }
}

  updateVelocity(nextState) {
    nextState.vx += Math.sin(this.state.windAngle * Math.PI / 180) * this.state.windSpeed / 1000;
    nextState.vy += Math.cos(this.state.windAngle * Math.PI / 180) * this.state.windSpeed / 1000;
  }

  handleCollision(nextState) {
    let arrow = this.arrowRef.current;
  
    if (this.state.scored === null) {
      for (let i = 0; i < this.state.targets.length; i++) {
        let target = this.state.targets[i];
        let collisionX = (arrow.state.x + length > target.x && arrow.state.x < target.x + (target.radius * 2));
        let collisionY = (arrow.state.y + length > target.y && arrow.state.y < target.y + (target.radius * 2));
  
        if (collisionX && collisionY && arrow.props.type === target.type && !target.isHit) {
          nextState.scored = true;
          nextState.score += 1;
          nextState.vx = 0;
          nextState.vy = -10;
  
          nextState.targets[i].isHit = true;
  
          setTimeout(() => {
            if (this.allTargetsHit()) {
              this.showGameOverAlert();
            } else {
                this.setState({
                  showingSelection: true,
                  selectedArrow: null,
                });
            }
          }, 800);          
  
          if (nextState.score > nextState.highScore) {
            nextState.highScore = nextState.score;
            AsyncStorage.setItem('highScore', JSON.stringify({ highScore: nextState.highScore }));
          }
          break;
        }
      }
    }
  }
  
  allTargetsHit() {
    return this.state.targets.every(target => target.isHit);
  }
  
  showGameOverAlert() {
    Alert.alert(
      'Game Over',
      `You hit all the targets!`,
      [
        {
          text: 'Restart',
          onPress: () => {
            this.restartGame();
          },
        },
        // {
        //   text: 'Exit',
        //   onPress: () => {
        //     this.restartGame();
        //   },
        // },
      ]
    );
  }
  
  restartGame() {
    this.setState({
      score: 0,
      targets: this.generateTargets(),
      scored: null,
      showingSelection: true,
      selectedArrow: null,
      highScore: this.state.highScore,
    });
  }

  handleRestart(nextState) {
    let arrow = this.arrowRef.current;
    let outOfScreenX = arrow.state.x > WINDOW_WIDTH || arrow.state.x < 0 - length * 2;
    let outOfScreenY = arrow.state.y > WINDOW_HEIGHT || arrow.state.y < 0 - length * 2;
    if (outOfScreenX || outOfScreenY) {
      this.restart(nextState);
    }
  }

  restart(state) {
    if (!state.scored) {
      state.score = 0;
    }
    state.scored = null;
    state.vy = 6;
    state.vx = 0;
    state.lifecycle = LC_WAITING;
    this.generateWind(state);
    this.arrowRef.current.restart();
  }

  onStart(angle, dy) {
    if (this.state.lifecycle === LC_WAITING) {
      if (angle < -90 && angle >= -180) {
        angle += 90;
      } else if (angle < -180 && angle >= -270) {
        angle = 270 - angle;
      } else if (angle < -270 && angle >= -360) {
        angle = 360 + angle;
      }
      this.setState({
        vx: angle * 0.1,
        vy: -dy / 10,
        lifecycle: LC_STARTING,
      });
    }
  }

  selectArrow(type) {
    this.setState({ 
      selectedArrow: type,
      showingSelection: false
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.showingSelection ? (
          <View style={styles.arrowSelector}>
          <Image
            source={require('./img/archery_gif.gif')}
            style={styles.archeryGif}
            resizeMode="contain"
          />
          <Text style={styles.header}>Select an Arrow</Text>
        
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={() => this.selectArrow('A')} 
              style={[
                styles.arrowButton, 
                this.state.selectedArrow === 'A' && styles.selectedArrow,
                (this.state.selectedArrow === 'A' || this.state.scored || (this.state.targets.length > 0 && this.state.targets[0].isHit)) && styles.disabledArrow
              ]}
              disabled={this.state.selectedArrow === 'A' || this.state.scored || (this.state.targets.length > 0 && this.state.targets[0].isHit)}
            >
              <Text style={styles.arrowLabel}>A</Text>
            </TouchableOpacity>
        
            <TouchableOpacity 
              onPress={() => this.selectArrow('B')} 
              style={[
                styles.arrowButton, 
                this.state.selectedArrow === 'B' && styles.selectedArrow,
                (this.state.selectedArrow === 'B' || this.state.scored || (this.state.targets.length > 1 && this.state.targets[1].isHit)) && styles.disabledArrow
              ]}
              disabled={this.state.selectedArrow === 'B' || this.state.scored || (this.state.targets.length > 1 && this.state.targets[1].isHit)}
            >
              <Text style={styles.arrowLabel}>B</Text>
            </TouchableOpacity>
        
            <TouchableOpacity 
              onPress={() => this.selectArrow('C')} 
              style={[
                styles.arrowButton, 
                this.state.selectedArrow === 'C' && styles.selectedArrow,
                (this.state.selectedArrow === 'C' || this.state.scored || (this.state.targets.length > 2 && this.state.targets[2].isHit)) && styles.disabledArrow
              ]}
              disabled={this.state.selectedArrow === 'C' || this.state.scored || (this.state.targets.length > 2 && this.state.targets[2].isHit)}
            >
              <Text style={styles.arrowLabel}>C</Text>
            </TouchableOpacity>
          </View>
        
          {/* Colored Arrows Below the Buttons */}
          <View style={styles.coloredArrowsContainer}>
            <Image
              source={require('./img/arrow.png')}
              style={styles.coloredArrow}
            />
            <Image
              source={require('./img/arrow.png')}
              style={styles.coloredArrow}
            />
            <Image
              source={require('./img/arrow.png')}
              style={styles.coloredArrow}
            />
          </View>
          </View>        
        
        ) : (
          <>
            <Detail
              score={this.state.score}
              highScore={this.state.highScore}
              windSpeed={this.state.windSpeed}
              windAngle={this.state.windAngle}
              selectedArrow={this.state.selectedArrow}
            />
            {this.state.targets.map(target => (
              <Target
                key={target.id}
                y={target.y}
                x={target.x}
                radius={target.radius}
                isHit={target.isHit}
                targetKey={parseInt(target.id)}
              />
            ))}
            <Arrow
              ref={this.arrowRef}
              onStart={this.onStart.bind(this)}
              lifecycle={this.state.lifecycle}
              length={length}
              type={this.state.selectedArrow}
            />
          </>
        )}
      </View>
    );
  }

  generateWind(state) {
    state.windSpeed = Math.floor(Math.random() * 100);
    state.windAngle = Math.floor(Math.random() * 360);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arrowButton: {
    padding: 10,
  },
  arrowLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedArrow: {
    backgroundColor: '#ddd',
  },
  disabledArrow: {
    backgroundColor: 'lightgrey',
  },
  disabledText: {
    color: 'lightgrey',
  },
  arrowSelector: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  archeryGif: {
    width: 200, 
    height: 200,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  coloredArrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  coloredArrow: {
    width: 20,
    height: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
});

export default Archery;
