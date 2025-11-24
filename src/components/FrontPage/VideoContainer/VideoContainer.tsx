import style from '@/components/FrontPage/VideoContainer/VideoContainer.module.css';

type VideoContainerProps = {
  text: string;
  video: string;
};

const VideoContainer = ({ text, video }: VideoContainerProps) => {
  return (
    <div className={style.videoContainerFull}>
      <p>{text}</p>
      <div className={style.videoContainer}>
        <video src={video} autoPlay loop muted playsInline width={300} height={300} />
      </div>
    </div>
  );
};
export default VideoContainer;
