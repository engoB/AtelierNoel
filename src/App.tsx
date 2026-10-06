import { Navigate, Route, Routes } from 'react-router-dom'

import { ProfilePicker } from './components/ProfilePicker'
import { GiftJournal } from './components/GiftJournal'
import { ParentGate } from './components/ParentGate'
import { KindnessMeter } from './components/KindnessMeter'
import { ChristmasEve } from './components/ChristmasEve'
import { ChristmasThanks } from './components/ChristmasThanks'
import { Workshop } from './components/Workshop'
import { useAppData } from './hooks/useAppData'

export default function App() {
  const appData = useAppData()

  return (
    <Routes>
      <Route path="/" element={<ProfilePicker appData={appData} />} />
      <Route path="/profil/:profileId" element={<Workshop appData={appData} />} />
      <Route path="/profil/:profileId/cadeau/:giftId" element={<GiftJournal appData={appData} />} />
      <Route path="/parents" element={<ParentGate appData={appData} />} />
      <Route path="/profil/:profileId/gentillometre" element={<KindnessMeter appData={appData} />} />
      <Route path="/profil/:profileId/24-decembre" element={<ChristmasEve appData={appData} />} />
      <Route path="/profil/:profileId/merci" element={<ChristmasThanks appData={appData} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
