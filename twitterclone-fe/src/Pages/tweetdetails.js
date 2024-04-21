import React, { useEffect, useState } from 'react'
import Sidebar from '../component/Sidebar'
import axios from 'axios'
import { API_BASE_URL } from '../Config/config'
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faRetweet, faComment } from "@fortawesome/free-solid-svg-icons"
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const Tweetdetails = () => {
    const { tweetId } = useParams()
    const [Liked, setLiked] = useState(false)
    const [Reply, setReply] = useState([])
    const [ReplyT, setReplyT] = useState("")
    const [Show, setShow] = useState(false)
    const Dispatch = useDispatch()
    const config = {
        headers: {
            "Content-type": "application/json",
            "authorization": "Bearer " + localStorage.getItem("token")
        }
    }

    const action = async (id) => {
        try {
            if (!Liked) {
                const likedT = await axios.get(`${API_BASE_URL}/Like/tweet/${id}`, config)
                if (likedT.status === 200) {
                    toast.info("You Liked the Tweet")
                    setLiked(true)
                }
            } else {
                const DislikeT = await axios.get(`${API_BASE_URL}/DisLike/tweet/${id}`, config)
                if (DislikeT.status === 200) {
                    toast.warn("You Dislike the Tweet")
                    setLiked(false)
                }
            }
        } catch (err) {
            console.log(err)
            toast.error(err.response.data.msg)
        }
    }

    const tweetDetails = async () => {
        try {
            const details = await axios.get(`${API_BASE_URL}/tweet/${tweetId}`, config)
            if (details.status === 200) {
                Dispatch({ type: "DETAILS", payload: details.data.tweetDetail })
                setReply(details.data.ReplyData)
            }
        } catch (err) {
            console.log(err)
        }
    }

    const ReplyTweet = async (id, e) => {
        try {
            e.preventDefault()
            const replied = await axios.post(`${API_BASE_URL}/Reply/tweet/${id}`, {
                Content: ReplyT
            }, config)
            if (replied.status === 200) {
                toast.success("you Replied the tweet")
                const details = await axios.get(`${API_BASE_URL}/tweet/${tweetId}`, config)
                if (details.status === 200) {
                    setReply(details.data.ReplyData)
                    setReplyT("")
                    setShow(false)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    const comment = (e) => {
        e.preventDefault()
        setShow(!Show)
    }

    const Retweet = async (id) => {
        try {
            const retweetdata = await axios.get(`${API_BASE_URL}/Retweet/${id}`, config)
            if (retweetdata.status === 200) {
                const details = await axios.get(`${API_BASE_URL}/tweet/${tweetId}`, config)
                if (details.status === 200) {
                    setReply(details.data.ReplyData)
                }
                toast.info("you Retweeted")
            }
        } catch (err) {
            console.log(err)
            toast.error(err.response.data.msg)
        }
    }

    const Tdetails = useSelector(state => state.TweetReducer)

    useEffect(() => {
        Tweetdetails()
    }, [])

    return (
        <div className='container'>
            <div className='row'>
                <Sidebar />
                <div className='col-8'>
                    <div className="card w-75  ms-5 mt-2 ">
                        <div className='d-flex mt-2 justify-content-between'>
                            <p className='text-muted ms-3 fs-6 fw-bold'> <FontAwesomeIcon icon={faRetweet} style={{ color: "#19c836", }} /></p>
                        </div>
                        <div className='d-flex '>
                            <img className="profile-pic ms-md-2" src={Tdetails.tweet.TweetedBy.ProfilePic} />
                            <p className=' card-text fw-bold  me-2' >{Tdetails.tweet.TweetedBy.Name}</p>
                            <p className='fs-6 text-muted mb-0'>  {new Date(Tdetails.tweet.createdAt).getDate()}/{new Date(Tdetails.tweet.createdAt).getMonth() + 1}/{new Date(Tdetails.tweet.createdAt).getFullYear()}</p>
                        </div>
                        <div className="card-body">
                            <h6 className="card-title">{Tdetails.tweet.Content}</h6>
                            {Tdetails.tweet.Image &&
                                <div className='photo-wrapper '>
                                    <img
                                        src={Tdetails.tweet.Image}
                                        className="img-fluid "
                                        alt=""
                                    />
                                </div>
                            }
                            <div className='mt-4'>
                                <FontAwesomeIcon className='me-1 btn' onClick={() => action(Tdetails.tweet._id)} icon={faHeart} style={{ color: "#ec0909" }} />
                                <FontAwesomeIcon className='me-1 btn' onClick={comment} icon={faComment} style={{ color: "#a2b9e2", }} />
                                <FontAwesomeIcon className=' btn' icon={faRetweet} onClick={() => Retweet(Tdetails.tweet._id)} style={{ color: "#19c836", }} />
                                {Show &&
                                    <form className='d-flex' onSubmit={(e) => ReplyTweet(Tdetails.tweet._id, e)}>
                                        <input className='form-control w-50' type='text' onChange={(e) => setReplyT(e.target.value)} placeholder='Reply your tweet' />
                                        <input className="btn btn-tweet ms-2" type='submit' />
                                    </form>
                                }
                            </div>
                        </div>
                    </div>
                    <h4 className='text-center'>REPLIES</h4>
                    {Reply.map(P => {
                        return (
                            <div className="card w-75  ms-5 mt-2 ">
                                <div className='d-flex mt-2 justify-content-between'>
                                    {P.Retweet.length > 0 &&
                                        <p className='text-muted ms-3 fs-6 fw-bold'> <FontAwesomeIcon icon={faRetweet} style={{ color: "#19c836" }} />Retweeted by {P.Retweet[0].Name}  </p>
                                    }
                                </div>
                                <div className='d-flex '>
                                <img className="profile-pic ms-md-2" src={P.TweetedBy.ProfilePic} />
                                    <p className='card-text fw-bold me-2'>{P.TweetedBy.Name}</p>
                                    <p className='fs-6 text-muted mb-0'>{new Date(P.createdAt).getDate()}/{new Date(P.createdAt).getMonth() + 1}/{new Date(P.createdAt).getFullYear()}</p>
                                </div>
                                <div className="card-body">
                                    <h6 className="card-title">{P.Content}</h6>
                                    {P.Image &&
                                        <div className='photo-wrapper'>
                                            <img
                                                src={P.Image}
                                                className="img-fluid"
                                                alt=""
                                            />
                                        </div>
                                    }
                                    <div className='mt-4'>
                                        <FontAwesomeIcon className='me-1 btn' onClick={(e) => action(P._id)} icon={faHeart} style={{ color: "#ec0909" }} />
                                        <FontAwesomeIcon className='me-1 btn' onClick={comment} icon={faComment} style={{ color: "#a2b9e2" }} />
                                        <FontAwesomeIcon className='btn' icon={faRetweet} onClick={() => Retweet(P._id)} style={{ color: "#19c836" }} />
                                        {Show &&
                                            <form className='d-flex' onSubmit={(e) => ReplyTweet(P._id, e)}>
                                                <input className='form-control w-50' type='text' onChange={(e) => setReplyT(e.target.value)} placeholder='Reply your tweet' />
                                                <input className="btn btn-tweet ms-2" type='submit' />
                                            </form>
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Tweetdetails

