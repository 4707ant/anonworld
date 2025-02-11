'use client'

import { Content } from '@/components/content'
import { VaultDisplay, VaultPosts, useVault } from '@anonworld/react'
import { Text, View, XStack } from '@anonworld/ui'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: vault } = useVault(params.id)

  if (!vault) {
    return null
  }

  return (
    <Content>
      <VaultDisplay vault={vault} />
      <XStack gap="$2" $xs={{ px: '$2' }}>
        <View bg="$color12" py="$2" px="$3" br="$12">
          <Text fow="600" fos="$2" color="$color1">
            Posts
          </Text>
        </View>
      </XStack>
      <VaultPosts id={vault.id} />
    </Content>
  )
}
