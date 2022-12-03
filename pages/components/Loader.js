import Image from 'next/image'

import loader from '../../public/loader.svg'

const Loader = () => {
    return <Image width={200} height={100} src={loader} alt="loading" id='loading' />
}

export default Loader;
