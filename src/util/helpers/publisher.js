class Publisher {
  constructor(props) {
    this.props = props;
  }

  // Sample method to demonstrate functionality
  publish(event) {
    console.log(`Publishing event: ${event} with props:`, this.props);
  }
}

export default Publisher;