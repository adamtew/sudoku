const SolveIcon = (props) => <svg className="solve-icon" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <defs>
        <path d="M0 0h24v24H0V0z" id="a"/>
    </defs>
    <clipPath id="b">
        <use overflow="visible" xlinkHref="#a"/>
    </clipPath>
    <path clipPath="url(#b)" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
</svg>

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      puzzle: '',
      n: 0,
      symbols: [],
      solved: null,
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
  }

  handleLoad(e) {
    const rows = e.target.result.split('\n')
    const n = Number(rows[0])
    const s = rows[1].split(' ')
    let symbols = new Uint8Array(n)
    symbols = symbols.map((item, index) => s[index].charCodeAt(0))
    symbols = Module.vecFromArray(symbols)
    let puzzle = []
    for (let i = 2; i < n + 2; i++) {
      let b = new Uint8Array(n)
      const r = rows[i].split(' ')
      b = b.map((item, index) => r[index].charCodeAt(0))
      puzzle = puzzle.concat(b)
    }

    let vectors = []
    let v = new Uint8Array(n)
    for (let i = 0; i < n; i++) {
      v[i] = Module.vecFromArray(puzzle[i])
    }
    for(let i = 0; i < n; i++) {
      vectors = vectors.concat([ Module.vecFromArray(puzzle[i]) ])
    }
    const new2d = Module.vecFromJSTypedArray(vectors)
    for (let i = 0; i < new2d.size(); i++) {
      new2d.set(i, vectors[i])
    }
    const p = new Module.make_puzzle(n, symbols, new2d)
    this.setState({n: n, symbols: symbols, puzzle: p, solved: null})
    
  }

  handleChange(file) {
    const fileReader = new FileReader()
    fileReader.onload = (e) => this.handleLoad(e)
    fileReader.readAsText(file)
  }
  render() {
    
    const symbols = []
    for (let i = 0; i < this.state.n; i++) {
      symbols.push(this.state.symbols.get(i))
    }

    const data = []
    if (this.state.puzzle.data) {
      console.log('this.state.puzzle.get()', this.state.puzzle.data)
      for (let i = 0; i < this.state.n; i++) {
        data.push([])
        for (let j = 0; j < this.state.n; j++) {
          data[i].push(String.fromCharCode(this.state.puzzle.data.get(i).get(j)))
        }
      }
    }
    const Tile = (props) => <div className={props.className} style={props.style}> {props.item} </div>
    console.log('sqrt(n)', Math.sqrt(this.state.n))
    const tiles = data.map((item, index) => {
      const row = item.map((item2, index2) => <Tile
        style={{borderLeft: index2 && index2 % Math.sqrt(this.state.n) == 0 ? '1px solid black' : ''}}
        className={`tile`}
        item={item2}
      />)
      return <div
        className="tile-container"
        style={{borderTop: index > 0 && index % Math.sqrt(this.state.n) == 0 ? '1px solid black' : ''}}
      >{row}</div>
    })
    const info = `Size: ${this.state.n}x${this.state.n}, Symbols: ${symbols.map((item, index) => ` ${String.fromCharCode(item)}`)}`
    console.log('this.state', this.state)
    return <div>
      <div className="menu">
        <input
          name="file"
          type="file"
          ref={(el) => this.fileInput = el}
          onClick={(e) => {e.target.value = null}}
          onChange={(e) => this.handleChange(e.target.files[0])}
        />
        <button
          className="solve-button"
          onClick={() => {
            const solver = new Module.Solver(this.state.puzzle)
            solver.solve() ? this.setState({solved: true}) : this.setState({solved: false})
            this.forceUpdate()
          }}
        ><SolveIcon /></button>
        { this.state.solved != null && 
          <div className="solved">{this.state.solved == true ? 'Solved!' : 'Couldn\'t Solve'}</div>
        }
      </div>
      <div className="wrapper">
        { this.state.n > 0 && 
          <div className="info">{info} </div>
        }
        <div className="tiles-container">
         { tiles }
        </div>
      </div>
    </div>
  }
}


ReactDOM.render(<App />, document.getElementById('root'))



