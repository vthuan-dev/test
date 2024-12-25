const Card = () => {
   return (
      <div className="item_product_four">
         <div className="product-thumbnail">
            <a className="image_thumb scale_hover" href="/hat-sen-tuoi" title="Hạt sen tươi">
               <img
                  width="520"
                  height="520"
                  className="lazyload image1 loaded"
                  src="//bizweb.dktcdn.net/thumb/large/100/514/629/products/hat-sen-tuoi.jpg?v=1713587709807"
                  data-src="//bizweb.dktcdn.net/thumb/large/100/514/629/products/hat-sen-tuoi.jpg?v=1713587709807"
                  alt="Hạt sen tươi"
                  data-was-processed="true"
               />
            </a>
            <div className="smart">
               <span>- 3%</span>
            </div>
         </div>
         <div className="product-info">
            <h3 className="product-name">
               <a href="/hat-sen-tuoi" title="Hạt sen tươi">
                  Hạt sen tươi
               </a>
            </h3>
            <div className="price-box">
               216.000₫
               <span className="compare-price">222.000₫</span>
            </div>
         </div>
      </div>
   );
};

export default Card;
