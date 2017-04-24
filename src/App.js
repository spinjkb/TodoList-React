import React, { Component } from 'react';
import './App.css';
import './login.css'
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import 'normalize.css';
import './reset.css';
// import * as localStore from './localStore'
import Login from './login';
import { getCurrentUser, signOut } from './leanCloud';
import AV from 'leancloud-storage'

// var APP_ID = 'BiV7UkDq4HQzFs90TMrDMJcI-gzGzoHsz';
// var APP_KEY = '7AG8p7wyob46a5iXEoDqDsGe';
// AV.init({
//   appId: APP_ID,
//   appKey: APP_KEY
// });
// var TestObject = AV.Object.extend('TestObject');
// var testObject = new TestObject();
// testObject.save({
//   words: 'Hello World!',
//   name:'jkb'
// }).then(function(object) {
//   alert('LeanCloud Rocks!');
// })

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // user: getCurrentUser() || {},
      user: this.unSign() || {},
      newTodo: '',
      todoList: [],
      currentUser: null
    }
  }
  render() {
    let todos = this.state.todoList.filter((item) => !item.deleted).map((item, index) => {
      return (
        <li key={index}>
          <TodoItem todo={item}
            onToggle={this.toggle.bind(this)}
            onDelete={this.delete.bind(this)} />
        </li>
      )
    })
    return (
      <div className="App">
        <h1>{this.state.user.username || '我'}的待办
          {this.state.user.id ? <button onClick={this.signOut.bind(this)}>登出</button> : null}
        </h1>
        <div className="inputWrapper">
          <TodoInput content={this.state.newTodo}
            onChange={this.changeTitle.bind(this)}
            onSubmit={this.addTodo.bind(this)} />
        </div>
        <ol className="todoList">
          {todos}
        </ol>
        {this.state.user.username ? null :
          <Login onSignUp={this.onSign.bind(this)}
            onSignIn={this.onSign.bind(this)} />}
      </div>
    );
  }
  unSign() {
    if (getCurrentUser()) {
      this.unSignSearch()
      // console.log(getCurrentUser())
      return getCurrentUser()
    } else {
      return null
    }
  }
  onSign(user) {
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    console.log(this.state)
    stateCopy.user = user
    console.log(user)
    stateCopy.currentUser = getCurrentUser();
    this.setState(stateCopy)
    this.searchTodo()
  }
  signOut() {
    signOut()
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    //清空
    stateCopy.user = {}
    stateCopy.todoList = []
    this.setState(stateCopy)
  }
  saveTodo() {
    let dataString = JSON.stringify(this.state.todoList)
    var AVTodos = AV.Object.extend('Todo');
    var avTodos = new AVTodos();
    //设置权限
    var acl = new AV.ACL();
    acl.setReadAccess(AV.User.current(), true)
    acl.setWriteAccess(AV.User.current(), true)
    avTodos.set('content', dataString);
    avTodos.setACL(acl)
    avTodos.save().then((todo) => {
      let stateCopy = JSON.parse(JSON.stringify(this.state))
      stateCopy.todoList.id = todo.id
      this.setState(stateCopy)
      console.log('保存成功');
    }, function (error) {
      alert('保存失败')
    })
  }
  updateTodo() {
    let dataString = JSON.stringify(this.state.todoList)
    let avTodos = AV.Object.createWithoutData('Todo', this.state.todoList.id)
    avTodos.set('content', dataString)
    avTodos.save().then(function () {
      console.log('update success')
    })
  }
  searchTodo() {
    if (this.state.currentUser) {
      var query = new AV.Query('Todo');
      query.find().then((todos) => {
        let avAlltodos = todos[0]
        let id = avAlltodos.id
        let stateCopy = JSON.parse(JSON.stringify(this.state))
        stateCopy.todoList = JSON.parse(avAlltodos.attributes.content)
        stateCopy.todoList.id = id
        this.setState(stateCopy)
      }, function (error) {
        console.error(error)
      })
    }
  }
  unSignSearch() {
    var query = new AV.Query('Todo');
    query.find().then((todos) => {
      let avAlltodos = todos[0]
      let id = avAlltodos.id
      let stateCopy = JSON.parse(JSON.stringify(this.state))
      stateCopy.todoList = JSON.parse(avAlltodos.attributes.content)
      stateCopy.todoList.id = id
      this.setState(stateCopy)
    }, function (error) {
      console.error(error)
    })

  }
  changeTodo() {
    this.state.todoList.id ? this.updateTodo() : this.saveTodo()
  }
  componentDidUpdate() {
  }
  changeTitle(event) {
    this.setState({
      newTodo: event.target.value,
      todoList: this.state.todoList
    })
  }
  toggle(e, todo) {
    todo.status = todo.status === 'completed' ? '' : 'completed';
    this.setState(this.state)
    this.changeTodo()
  }
  delete(event, todo) {
    todo.deleted = true;
    this.setState(this.state)
    this.changeTodo()
  }
  addTodo(event) {
    if (event.target.value === '') {
      alert('请输入内容')
    } else {
      this.state.todoList.push({
        id: idMaker(),
        title: event.target.value,
        status: null,
        deleted: false
      })
      this.setState({
        newTodo: '',
        todoList: this.state.todoList
      })
    }
    this.changeTodo()
  }
}

export default App;

let id = 0
function idMaker() {
  id += 1
  return id
}