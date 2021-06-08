import React, {FC, useEffect, useState} from 'react';
import axios from 'axios'
import shortid from 'shortid';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Typography,Table, Modal, Button, Spin } from 'antd';
import 'antd/dist/antd.css';

import './App.css';
import { API_BASE_URL, ORDER, PAGE_SIZE, SORT_BY } from './constants';
import { Question } from './QuestionInterface';

const { Title, Text } = Typography;

let page: number = 0;

const columns = [
  {
    title: 'Id',
    key: 'index',
    render: (text:string, record:Question, index:number) => index + 1,
  },
  {
    title: 'Author',
    dataIndex: ['owner','display_name'],
    key: 'display_name',
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Creation Date',
    dataIndex: 'creation_date',
    key: 'creation_date',
    render: (date:number) => {
      const dateObj = new Date(date)
      return `${dateObj.toLocaleString()}`
    }
  }
];

let initialLoad = true;
const App: FC = ()=> {
  const [loading,setLoading] = useState(false);
  const [questions,setQuestions] = useState<Question[]>([]);
  const [hasMore,setHasMore] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRow] = useState<Question | null>(null);


  const closeModal = ()=>{
    setModalVisible(false);
  }

  const getStackOverflowQues = async ()=>{
    if(!hasMore || loading) return;
    try{
      setLoading(true)
      page += 1;
      const response = await axios.get(`${API_BASE_URL}/questions?page=${page}&pagesize=${PAGE_SIZE}&order=${ORDER}&sort=${SORT_BY}&site=stackoverflow&filter=withBody`)
      if(page === 1) setQuestions(response.data.items)
      else setQuestions(prevQues => [...prevQues,...response.data.items]);
      setHasMore(response.data.has_more)
      setLoading(false)
    }catch(err){
      setLoading(false)
    }
  }

  const handleRowClick = (record:Question) => {
    return {
      onClick: ()=>{
        setSelectedRow(record);
        setModalVisible(true);
      }
    }
  }

  useEffect(()=>{
    if(initialLoad){
      getStackOverflowQues()
    }
    return ()=> {initialLoad = false;}
  })

  return (
    <div className="App">
      <Modal
          visible={modalVisible}
          title={selectedRecord?.title || 'Title'}
          onCancel={closeModal} 
          footer={[
            <Button key="back" onClick={closeModal}>
              Close
            </Button>,
            <Button
              key="link"
              target="_blank"
              href={selectedRecord?.link || '/'}
              type="primary"
            >
              Open on stackoverflow
            </Button>,
          ]}
        >
          {selectedRecord?.body}
        </Modal>
      <Title style={{color:'#187DDC'}}>StackOverflow Assignment</Title>
      <Text style={{color:'#fff'}}>By Ishant</Text>
      <InfiniteScroll
        dataLength={questions.length}
        next={getStackOverflowQues} 
        scrollThreshold={0.8}
        hasMore={!loading && hasMore}
        loader={(loading && <Spin/>)}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>Scroll to fetch more messages</b>
          </p>
        }
      >
        <Table rowKey={obj=>shortid.generate()} className="questions-table" columns={columns} dataSource={questions} pagination={false} onRow={handleRowClick} rowClassName="table-row-class" />
      </InfiniteScroll>
    </div>
  );
}

export default App;
