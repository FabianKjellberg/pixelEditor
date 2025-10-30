const Debug = () => {
  const x1 = 1;
  const x2 = -2;
  const y1 = -4;
  const y2 = -8;

  const longLength = Math.max(Math.abs(y2 - y1), Math.abs(x1 - x2));

  const xGrow = Math.abs(x1 - x2);
  const yGrow = Math.abs(y1 - y2);

  for (let i = 0; i <= longLength; i++) {
    console.log(
      Math.min(x1, x2) + Math.round((i / longLength) * xGrow),
      Math.min(y1, y2) + Math.round((i / longLength) * yGrow),
    );
  }

  return <></>;
};
export default Debug;

// xy(3,3) -> xy(8,10), size 3, xy(2,2) w8, h10
// xy(4,6) -> xy(9, 9), size 2, xy(4,6) w7, h5

// s1 x,w 1 -> 4 => 1, 4
// s2 x,w 1 -> 4 => 0, 5
// s3 x,w 1 -> 4 => 0, 6
// s4 x,w 1 -> 4 => -1, 7

//1 1 1 1 2 2 2 2
//1 2 3 4 5 6 7 8

//i/longLength * maxLength
