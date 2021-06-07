import React, {FC, useEffect, useState} from 'react';
import './App.css';
import axios from 'axios'
import { API_BASE_URL, ORDER, PAGE_SIZE, SORT_BY } from './constants';
import InfiniteScroll from 'react-infinite-scroll-component';
import 'antd/dist/antd.css';

import { Typography,Table, Modal, Button, Spin } from 'antd';
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
      console.log(response.data)
      if(page === 1) setQuestions(response.data.items)
      else setQuestions(prevQues => [...prevQues,...response.data.items]);
      setHasMore(response.data.has_more)
      setLoading(false)
    }catch(err){
      console.log(err)
      setLoading(false)
    }
  }

  const handleRowClick = (record:Question) => {
    return {
      onClick: ()=>{
        console.log(record)
        setSelectedRow(record);
        setModalVisible(true);
      }
    }
  }

  useEffect(()=>{
    getStackOverflowQues()
  },[])

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
      <Title>StackOverflow Assignment</Title>
      <Text>By Ishant</Text>
      <InfiniteScroll
        dataLength={questions.length}
        next={getStackOverflowQues}
        scrollThreshold={0.6}
        hasMore={hasMore}
        loader={<Spin/>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>There are no more questions.</b>
          </p>
        }
      >
        <Table className="questions-table" columns={columns} dataSource={questions} pagination={false} onRow={handleRowClick} rowClassName="table-row-class" />
      </InfiniteScroll>
    </div>
  );
}

export default App;
